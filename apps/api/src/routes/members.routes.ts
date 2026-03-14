import { Router } from "express";
import {
  createMemberController,
  getMemberSummaryController,
  listMembersController,
} from "../controllers/members.controller";

export const membersRouter = Router();

membersRouter.post("/", createMemberController);
membersRouter.get("/", listMembersController);
membersRouter.get("/:memberId/summary", getMemberSummaryController);