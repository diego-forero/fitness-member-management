import { Router } from "express";
import {
  createMemberController,
  getMemberSummaryController,
  listMembersController,
} from "../controllers/members.controller";
import { assignMembershipController } from "../controllers/memberships.controller";
import { recordCheckInController } from "../controllers/check-ins.controller";

export const membersRouter = Router();

membersRouter.post("/", createMemberController);
membersRouter.get("/", listMembersController);
membersRouter.get("/:memberId/summary", getMemberSummaryController);
membersRouter.post("/:memberId/memberships", assignMembershipController);
membersRouter.post("/:memberId/check-ins", recordCheckInController);