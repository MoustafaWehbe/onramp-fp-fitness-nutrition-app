import { CoachProfile, User } from "../models";

/** Whole years between `birthDate` and today, or null when unknown. */
function ageFrom(birthDate: string | null): number | null {
  if (!birthDate) return null;

  const born = new Date(birthDate);
  if (Number.isNaN(born.getTime())) return null;

  const today = new Date();
  let age = today.getUTCFullYear() - born.getUTCFullYear();
  const monthDelta = today.getUTCMonth() - born.getUTCMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getUTCDate() < born.getUTCDate())) {
    age -= 1;
  }
  return age;
}

export const coachService = {
  /**
   * Coach discovery. Open to any authenticated client, so it returns only what
   * the listing renders — no email addresses.
   */
  async listAvailable() {
    const coaches = await User.findAll({
      where: { role: "coach" },
      attributes: ["id", "name"],
      include: [{ model: CoachProfile, as: "coachProfile" }],
      order: [["name", "ASC"]],
    });

    return coaches.map((coach) => {
      const profile = coach.get("coachProfile") as CoachProfile | null;

      return {
        id: coach.id,
        name: coach.name,
        title: profile?.title ?? null,
        bio: profile?.bio ?? null,
        gender: profile?.gender ?? null,
        age: ageFrom(profile?.birthDate ?? null),
        specialties: profile?.specialties ?? null,
        yearsExperience: profile?.yearsExperience ?? null,
        certifications: profile?.certifications ?? null,
        rating: profile?.rating ?? null,
        clientsCount: profile?.clientsCount ?? 0,
        avatarUrl: profile?.avatarUrl ?? null,
      };
    });
  },
};
