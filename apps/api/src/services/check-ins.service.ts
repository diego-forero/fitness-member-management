import { AppError } from "../errors/app-error";
import {
  findActiveMembershipByMemberId,
  findMemberById,
} from "../repositories/members.repository";
import { createCheckIn } from "../repositories/check-ins.repository";

export async function recordCheckInService(memberId: string) {
  const member = await findMemberById(memberId);

  if (!member) {
    throw new AppError(404, "Member not found");
  }

  const activeMembership = await findActiveMembershipByMemberId(memberId);

  if (!activeMembership) {
    throw new AppError(400, "Only members with an active membership can check in");
  }

  const checkIn = await createCheckIn(activeMembership.id);

  if (!checkIn) {
    throw new AppError(500, "Failed to record check-in");
  }

  return {
    id: checkIn.id,
    memberId: member.id,
    membershipId: activeMembership.id,
    checkedInAt: checkIn.checkedInAt,
  };
}
