import { Router } from "express";
import { userProfileController } from "../controllers/userProfile.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.get("/", authenticate, userProfileController.getMine);
router.put("/", authenticate, userProfileController.upsert);

export { router as userProfileRouter };