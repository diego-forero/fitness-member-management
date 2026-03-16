import { NextFunction, Request, Response } from "express";
import {
  createPlanBodySchema,
  planIdParamSchema,
  updatePlanBodySchema,
} from "../validations/plans.validation";
import {
  createPlanService,
  deletePlanService,
  listAdminPlansService,
  listPlansService,
  updatePlanService,
} from "../services/plans.service";

export async function listPlansController(
  _request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const plans = await listPlansService();

    response.status(200).json(plans);
  } catch (error) {
    next(error);
  }
}

export async function listAdminPlansController(
  _request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const plans = await listAdminPlansService();

    response.status(200).json(plans);
  } catch (error) {
    next(error);
  }
}

export async function createPlanController(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const body = createPlanBodySchema.parse(request.body);
    const plan = await createPlanService(body);

    response.status(201).json(plan);
  } catch (error) {
    next(error);
  }
}

export async function updatePlanController(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const params = planIdParamSchema.parse(request.params);
    const body = updatePlanBodySchema.parse(request.body);
    const plan = await updatePlanService(params.planId, body);

    response.status(200).json(plan);
  } catch (error) {
    next(error);
  }
}

export async function deletePlanController(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const params = planIdParamSchema.parse(request.params);

    await deletePlanService(params.planId);

    response.status(204).send();
  } catch (error) {
    next(error);
  }
}
