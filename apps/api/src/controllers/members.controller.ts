import { NextFunction, Request, Response } from "express";
import {
  createMemberBodySchema,
  listMembersQuerySchema,
  memberIdParamSchema,
} from "../validations/members.validation";
import {
  createMemberService,
  getMemberSummaryService,
  listMembersService,
} from "../services/members.service";

export async function createMemberController(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const body = createMemberBodySchema.parse(request.body);

    const member = await createMemberService(body);

    response.status(201).json(member);
  } catch (error) {
    next(error);
  }
}

export async function listMembersController(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const query = listMembersQuerySchema.parse(request.query);

    const members = await listMembersService(query.query);

    response.status(200).json(members);
  } catch (error) {
    next(error);
  }
}

export async function getMemberSummaryController(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const params = memberIdParamSchema.parse(request.params);

    const summary = await getMemberSummaryService(params.memberId);

    response.status(200).json(summary);
  } catch (error) {
    next(error);
  }
}