import { Router } from "express";
import { listPlansController } from "../controllers/plans.controller";

export const plansRouter = Router();

plansRouter.get("/", listPlansController);