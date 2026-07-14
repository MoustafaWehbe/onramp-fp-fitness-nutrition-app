import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import {
  hashPassword,
  verifyPassword,
  generateTokenPair,
  verifyRefreshToken,
} from "@starter-kit/shared";
import { User, Session, RefreshToken } from "../models";
import { createError } from "../middleware/error-handler";

interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

interface LoginInput {
  email: string;
  password: string;
  userAgent?: string;
  ipAddress?: string;
}

interface GoogleLoginInput {
  credential: string;
  userAgent?: string;
  ipAddress?: string;
}

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class AuthService {
  async register(input: RegisterInput) {
    const existing = await User.findOne({ where: { email: input.email } });
    if (existing) {
      throw createError("Email already in use", 409);
    }

    const passwordHash = await hashPassword(input.password);
    const user = await User.create({
      email: input.email,
      passwordHash,
      name: input.name,
    });

    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  async login(input: LoginInput) {
    const user = await User.findOne({ where: { email: input.email } });
    if (!user) {
      throw createError("Invalid credentials", 401);
    }

    if (!user.passwordHash) {
      // account was created via Google and has no password set
      throw createError("Invalid credentials", 401);
    }

    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      throw createError("Invalid credentials", 401);
    }

    return this.createSessionAndTokens(user, input.userAgent, input.ipAddress);
  }

  async loginWithGoogle(input: GoogleLoginInput) {
    const ticket = await googleClient.verifyIdToken({
      idToken: input.credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      throw createError("Invalid Google token", 401);
    }

    let user = await User.findOne({ where: { email: payload.email } });
    if (!user) {
      user = await User.create({
        email: payload.email,
        name: payload.name ?? payload.email,
        googleId: payload.sub,
        emailVerified: true,
      });
    } else if (!user.googleId) {
      // existing password account signing in with Google for the first time — link it
      user.googleId = payload.sub;
      await user.save();
    }

    return this.createSessionAndTokens(user, input.userAgent, input.ipAddress);
  }

  private async createSessionAndTokens(
    user: User,
    userAgent?: string,
    ipAddress?: string,
  ) {
    const session = await Session.create({
      userId: user.id,
      userAgent,
      ipAddress,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1_000), // 7 days
    });

    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId: session.id,
    });

    const tokenHash = crypto
      .createHash("sha256")
      .update(tokens.refreshToken)
      .digest("hex");

    await RefreshToken.create({
      userId: user.id,
      sessionId: session.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1_000),
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  async refresh(rawToken: string) {
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const stored = await RefreshToken.findOne({ where: { tokenHash } });
    if (!stored || !stored.isValid) {
      throw createError("Invalid or expired refresh token", 401);
    }

    const payload = verifyRefreshToken(rawToken);
    const user = await User.findByPk(payload.userId);
    if (!user) throw createError("User not found", 404);

    // Rotate token
    await stored.update({ revokedAt: new Date() });

    const session = await Session.findByPk(stored.sessionId);
    if (!session) throw createError("Session not found", 401);

    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId: session.id,
    });

    const newHash = crypto
      .createHash("sha256")
      .update(tokens.refreshToken)
      .digest("hex");
    await RefreshToken.create({
      userId: user.id,
      sessionId: session.id,
      tokenHash: newHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1_000),
    });

    return tokens;
  }

  async logout(sessionId: string) {
    await RefreshToken.update(
      { revokedAt: new Date() },
      { where: { sessionId } },
    );
    await Session.destroy({ where: { id: sessionId } });
  }

  async getProfile(userId: string) {
    const user = await User.findByPk(userId, {
      attributes: ["id", "email", "name", "role", "emailVerified", "createdAt"],
    });
    if (!user) throw createError("User not found", 404);
    return user;
  }
}

export const authService = new AuthService();