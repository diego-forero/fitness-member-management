import { NextFunction, Request, Response } from "express";
import { listPlansService } from "../services/plans.service";

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