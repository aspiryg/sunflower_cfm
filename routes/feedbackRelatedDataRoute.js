import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.js";
import { feedbackRelatedDataController } from "../controllers/feedbackRelatedDataController.js";

const router = Router();
router.use(authenticateToken);

router.get("/categories", feedbackRelatedDataController.getCategories);
router.get("/channels", feedbackRelatedDataController.getChannels);
router.get("/providers", feedbackRelatedDataController.getProviders);
router.get("/programmes", feedbackRelatedDataController.getProgrammes);
router.get("/projects", feedbackRelatedDataController.getProjects);
router.get("/activities", feedbackRelatedDataController.getActivities);
router.get("/communities", feedbackRelatedDataController.getCommunities);

export default router;
