import { NextFunction, Request, Response } from "express";
import { memberIdParamSchema } from "../validations/members.validation";
import { assignMembershipBodySchema } from "../validations/memberships.validation";
import { assignMembershipService } from "../services/memberships.service";

export async function assignMembershipController(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const params = memberIdParamSchema.parse(request.params);
    const body = assignMembershipBodySchema.parse(request.body);

    const membership = await assignMembershipService(params.memberId, body);

    response.status(201).json(membership);
  } catch (error) {
    next(error);
  }
}