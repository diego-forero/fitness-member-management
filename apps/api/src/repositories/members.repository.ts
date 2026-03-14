import {
  and,
  count,
  desc,
  eq,
  gte,
  ilike,
  isNull,
  or,
} from "drizzle-orm";
import { db } from "../db/client";
import { checkIns, members, memberships, plans } from "../db/schema";

type CreateMemberInput = {
  firstName: string;
  lastName: string;
  email: string;
};

export async function findMemberByEmail(email: string) {
  const [member] = await db
    .select()
    .from(members)
    .where(eq(members.email, email))
    .limit(1);

  return member ?? null;
}

export async function createMember(data: CreateMemberInput) {
  const [member] = await db
    .insert(members)
    .values({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
    })
    .returning();

  return member;
}

export async function searchMembers(query?: string) {
  if (!query) {
    return db
      .select({
        id: members.id,
        firstName: members.firstName,
        lastName: members.lastName,
        email: members.email,
        createdAt: members.createdAt,
      })
      .from(members)
      .orderBy(desc(members.createdAt))
      .limit(50);
  }

  return db
    .select({
      id: members.id,
      firstName: members.firstName,
      lastName: members.lastName,
      email: members.email,
      createdAt: members.createdAt,
    })
    .from(members)
    .where(
      or(
        ilike(members.firstName, `%${query}%`),
        ilike(members.lastName, `%${query}%`),
        ilike(members.email, `%${query}%`),
      ),
    )
    .orderBy(desc(members.createdAt))
    .limit(50);
}

export async function findMemberById(memberId: string) {
  const [member] = await db
    .select({
      id: members.id,
      firstName: members.firstName,
      lastName: members.lastName,
      email: members.email,
      createdAt: members.createdAt,
      updatedAt: members.updatedAt,
    })
    .from(members)
    .where(eq(members.id, memberId))
    .limit(1);

  return member ?? null;
}

export async function findActiveMembershipByMemberId(memberId: string) {
  const [membership] = await db
    .select({
      membershipId: memberships.id,
      startsAt: memberships.startsAt,
      planId: plans.id,
      planCode: plans.code,
      planName: plans.name,
    })
    .from(memberships)
    .innerJoin(plans, eq(memberships.planId, plans.id))
    .where(
      and(
        eq(memberships.memberId, memberId),
        isNull(memberships.cancellationEffectiveAt),
      ),
    )
    .orderBy(desc(memberships.startsAt))
    .limit(1);

  if (!membership) {
    return null;
  }

  return {
    id: membership.membershipId,
    startsAt: membership.startsAt,
    plan: {
      id: membership.planId,
      code: membership.planCode,
      name: membership.planName,
    },
  };
}

export async function findLastCheckInByMembershipId(membershipId: string) {
  const [lastCheckIn] = await db
    .select({
      checkedInAt: checkIns.checkedInAt,
    })
    .from(checkIns)
    .where(eq(checkIns.membershipId, membershipId))
    .orderBy(desc(checkIns.checkedInAt))
    .limit(1);

  return lastCheckIn ?? null;
}

export async function countCheckInsLast30DaysByMembershipId(
  membershipId: string,
) {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - 30);

  const [result] = await db
    .select({
      count: count(),
    })
    .from(checkIns)
    .where(
      and(
        eq(checkIns.membershipId, membershipId),
        gte(checkIns.checkedInAt, thresholdDate),
      ),
    );

  return Number(result?.count ?? 0);
}