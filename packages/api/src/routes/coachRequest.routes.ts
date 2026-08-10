import { Router } from "express";
import { coachRequestController } from "../controllers/coachRequest.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import {
  coachRequestIdSchema,
  createCoachRequestSchema,
} from "../schemas/coach.schemas";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(createCoachRequestSchema),
  coachRequestController.create,
);
router.get("/mine", authenticate, coachRequestController.getMine);

router.get(
  "/pending",
  authenticate,
  authorize("coach"),
  coachRequestController.listPending,
);
router.get(
  "/accepted",
  authenticate,
  authorize("coach"),
  coachRequestController.listAccepted,
);
router.patch(
  "/:coachRequestId/accept",
  authenticate,
  authorize("coach"),
  validate(coachRequestIdSchema, "params"),
  coachRequestController.accept,
);
router.patch(
  "/:coachRequestId/decline",
  authenticate,
  authorize("coach"),
  validate(coachRequestIdSchema, "params"),
  coachRequestController.decline,
);

export { router as coachRequestRouter };
