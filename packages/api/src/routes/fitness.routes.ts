import { Router } from "express";
import { fitnessController } from "../controllers/fitness.controller";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import {
  saveMeasurementSchema,
  sendFitnessChatSchema,
} from "../schemas/fitness.schemas";

const router = Router();

router.use(authenticate);
router.get("/summary", fitnessController.summary);
router.post(
  "/measurements",
  validate(saveMeasurementSchema),
  fitnessController.saveMeasurement,
);
router.post("/chat", validate(sendFitnessChatSchema), fitnessController.sendChat);

export { router as fitnessRouter };
