import { AppError } from "../errors/app-error";
import {
  findActiveMembershipByMemberId,
  findMemberById,
} from "../repositories/members.repository";
import { createMembership } from "../repositories/memberships.repository";
import { findPlanById } from "../repositories/plans.repository";

type AssignMembershipInput = {
  planId: string;
  startDate: Date;
};

function isDatabaseUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

export async function assignMembershipService(
  memberId: string,
  input: AssignMembershipInput,
) {
  const member = await findMemberById(memberId);

  if (!member) {
    throw new AppError(404, "Member not found");
  }

  const plan = await findPlanById(input.planId);

  if (!plan) {
    throw new AppError(404, "Plan not found");
  }

  if (!plan.isActive) {
    throw new AppError(400, "Plan is not active");
  }

  if (input.startDate.getTime() > Date.now()) {
    throw new AppError(400, "Start date cannot be in the future");
  }

  const existingActiveMembership = await findActiveMembershipByMemberId(memberId);

  if (existingActiveMembership) {
    throw new AppError(409, "Member already has an active membership");
  }

  try {
    const membership = await createMembership({
      memberId,
      planId: input.planId,
      startsAt: input.startDate,
    });

    return {
      ...membership,
      plan: {
        id: plan.id,
        code: plan.code,
        name: plan.name,
      },
    };
  } catch (error) {
    if (isDatabaseUniqueViolation(error)) {
      throw new AppError(409, "Member already has an active membership");
    }

    throw error;
  }
}