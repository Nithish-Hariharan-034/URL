import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import urlsRouter from "./urls";
import analyticsRouter from "./analytics";
import dashboardRouter from "./dashboard";
import redirectRouter from "./redirect";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(urlsRouter);
router.use(analyticsRouter);
router.use(dashboardRouter);
router.use(redirectRouter);

export default router;
