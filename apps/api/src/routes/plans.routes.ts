import { Router } from "express";
import {
  createPlanController,
  deletePlanController,
  listAdminPlansController,
  listPlansController,
  updatePlanController,
} from "../controllers/plans.controller";

export const plansRouter = Router();

plansRouter.get("/admin", listAdminPlansController);
plansRouter.get("/", listPlansController);
plansRouter.post("/", createPlanController);
plansRouter.patch("/:planId", updatePlanController);
plansRouter.delete("/:planId", deletePlanController);
