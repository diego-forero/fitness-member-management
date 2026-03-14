import { NextFunction, Request, Response } from "express";
import { assignMembershipBodySchema, membershipParamsSchema } from "../validations/memberships.validation";
import { memberIdParamSchema } from "../validations/members.validation";
import {
  assignMembershipService,
  cancelMembershipService,
} from "../services/memberships.service";

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

export async function cancelMembershipController(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const params = membershipParamsSchema.parse(request.params);

    const membership = await cancelMembershipService(
      params.memberId,
      params.membershipId,
    );

    response.status(200).json(membership);
  } catch (error) {
    next(error);
  }
}