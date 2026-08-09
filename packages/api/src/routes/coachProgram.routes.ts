import { Router } from "express";
import { coachProgramController } from "../controllers/coachProgram.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import {
  createCoachProgramSchema,
  programDayParamsSchema,
  programIdSchema,
  updateCoachProgramSchema,
  upsertProgramDaySchema,
} from "../schemas/coachProgram.schemas";

const router = Router();

router.use(authenticate, authorize("coach"));

router.post("/", validate(createCoachProgramSchema), coachProgramController.create);
router.get("/", coachProgramController.list);

router.get(
  "/:programId",
  validate(programIdSchema, "params"),
  coachProgramController.getOne,
);
router.patch(
  "/:programId",
  validate(programIdSchema, "params"),
  validate(updateCoachProgramSchema),
  coachProgramController.update,
);
router.put(
  "/:programId/days/:dayNumber",
  validate(programDayParamsSchema, "params"),
  validate(upsertProgramDaySchema),
  coachProgramController.upsertDay,
);
router.post(
  "/:programId/publish",
  validate(programIdSchema, "params"),
  coachProgramController.publish,
);

export { router as coachProgramRouter };
