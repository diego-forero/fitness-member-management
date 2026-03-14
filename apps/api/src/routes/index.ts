import { Router } from "express";
import { healthRouter } from "./health.routes";
import { membersRouter } from "./members.routes";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/members", membersRouter);