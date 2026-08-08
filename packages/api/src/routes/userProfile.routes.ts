import { Router } from "express";
import { userProfileController } from "../controllers/userProfile.controller";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { upsertUserProfileSchema } from "../schemas/userProfile.schemas";

const router = Router();

router.get("/", authenticate, userProfileController.getMine);
router.put(
  "/",
  authenticate,
  validate(upsertUserProfileSchema),
  userProfileController.upsert,
);

export { router as userProfileRouter };