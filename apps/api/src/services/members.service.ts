import { AppError } from "../errors/app-error";
import {
  countCheckInsLast30DaysByMembershipId,
  createMember,
  findActiveMembershipByMemberId,
  findLastCheckInByMembershipId,
  findMemberByEmail,
  findMemberById,
  searchMembers,
} from "../repositories/members.repository";

type CreateMemberInput = {
  firstName: string;
  lastName: string;
  email: string;
};

export async function createMemberService(input: CreateMemberInput) {
  const normalizedEmail = input.email.trim().toLowerCase();

  const existingMember = await findMemberByEmail(normalizedEmail);

  if (existingMember) {
    throw new AppError(409, "A member with this email already exists");
  }

  const member = await createMember({
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: normalizedEmail,
  });

  return member;
}

export async function listMembersService(query?: string) {
  const normalizedQuery = query?.trim();

  return searchMembers(normalizedQuery);
}

export async function getMemberSummaryService(memberId: string) {
  const member = await findMemberById(memberId);

  if (!member) {
    throw new AppError(404, "Member not found");
  }

  const activeMembership = await findActiveMembershipByMemberId(memberId);

  if (!activeMembership) {
    return {
      member,
      hasActiveMembership: false,
      activeMembership: null,
      lastCheckInAt: null,
      checkInCountLast30Days: 0,
    };
  }

  const lastCheckIn = await findLastCheckInByMembershipId(activeMembership.id);
  const checkInCountLast30Days =
    await countCheckInsLast30DaysByMembershipId(activeMembership.id);

  return {
    member,
    hasActiveMembership: true,
    activeMembership,
    lastCheckInAt: lastCheckIn?.checkedInAt ?? null,
    checkInCountLast30Days,
  };
}