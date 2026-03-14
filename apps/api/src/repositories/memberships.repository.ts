import { and, eq } from "drizzle-orm";
import { db } from "../db/client";
import { memberships } from "../db/schema";

type CreateMembershipInput = {
  memberId: string;
  planId: string;
  startsAt: Date;
};

export async function createMembership(data: CreateMembershipInput) {
  const [membership] = await db
    .insert(memberships)
    .values({
      memberId: data.memberId,
      planId: data.planId,
      startsAt: data.startsAt,
    })
    .returning({
      id: memberships.id,
      memberId: memberships.memberId,
      planId: memberships.planId,
      startsAt: memberships.startsAt,
      cancellationEffectiveAt: memberships.cancellationEffectiveAt,
      createdAt: memberships.createdAt,
      updatedAt: memberships.updatedAt,
    });

  return membership;
}

export async function findMembershipById(membershipId: string) {
  const [membership] = await db
    .select({
      id: memberships.id,
      memberId: memberships.memberId,
      planId: memberships.planId,
      startsAt: memberships.startsAt,
      cancellationEffectiveAt: memberships.cancellationEffectiveAt,
      createdAt: memberships.createdAt,
      updatedAt: memberships.updatedAt,
    })
    .from(memberships)
    .where(eq(memberships.id, membershipId))
    .limit(1);

  return membership ?? null;
}

export async function cancelMembershipById(membershipId: string) {
  const cancellationTimestamp = new Date();

  const [membership] = await db
    .update(memberships)
    .set({
      cancellationEffectiveAt: cancellationTimestamp,
      updatedAt: cancellationTimestamp,
    })
    .where(eq(memberships.id, membershipId))
    .returning({
      id: memberships.id,
      memberId: memberships.memberId,
      planId: memberships.planId,
      startsAt: memberships.startsAt,
      cancellationEffectiveAt: memberships.cancellationEffectiveAt,
      createdAt: memberships.createdAt,
      updatedAt: memberships.updatedAt,
    });

  return membership;
}