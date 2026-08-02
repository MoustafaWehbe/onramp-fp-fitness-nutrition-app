import { Router } from "express";
import { authRouter } from "./auth.routes";
import { programRouter } from "./program.routes";
import { dayPlanRouter } from "./dayPlan.routes";
import { adminRouter } from "./admin.routes";
import { fitnessRouter } from "./fitness.routes";
import { userProfileRouter } from "./userProfile.routes";
import { coachRequestRouter } from "./coachRequest.routes";
import { coachRouter } from "./coach.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/programs", programRouter);
router.use("/day-plans", dayPlanRouter);
router.use("/admin", adminRouter);
router.use("/fitness", fitnessRouter);
router.use("/profile", userProfileRouter);
router.use("/coach-requests", coachRequestRouter);
router.use("/coaches", coachRouter);
export { router };