// packages/api/src/routes/admin.routes.ts
import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { adminController } from "../controllers/admin.controller";

const router = Router();

// authenticate: are you logged in?
// authorize("admin"): are you an admin?
router.use(authenticate, authorize("admin"));

router.get("/users", adminController.getAllUsers);
router.get("/analytics", adminController.getAnalytics);

export { router as adminRouter };