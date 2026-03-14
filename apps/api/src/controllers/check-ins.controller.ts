import { NextFunction, Request, Response } from "express";
import { memberIdParamSchema } from "../validations/members.validation";
import { recordCheckInService } from "../services/check-ins.service";

export async function recordCheckInController(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const params = memberIdParamSchema.parse(request.params);

    const checkIn = await recordCheckInService(params.memberId);

    response.status(201).json(checkIn);
  } catch (error) {
    next(error);
  }
}