import { Router } from "express";
import { authRouter } from "./auth.routes";
import { programRouter } from "./program.routes";
import { dayPlanRouter } from "./dayPlan.routes";
import { adminRouter } from "./admin.routes";
import { fitnessRouter } from "./fitness.routes";
import { coachRouter } from "./coach.routes";
import { coachProfileRouter } from "./coachProfile.routes";
import { coachRequestRouter } from "./coachRequest.routes";
import { userProfileRouter } from "./userProfile.routes";


const router = Router();

router.use("/auth", authRouter);
router.use("/programs", programRouter);
router.use("/day-plans", dayPlanRouter);
router.use("/admin", adminRouter);
router.use("/fitness", fitnessRouter);
router.use("/coaches", coachRouter);
router.use("/coach-profile", coachProfileRouter);
router.use("/coach-requests", coachRequestRouter);
router.use("/profile", userProfileRouter);

export { router };
