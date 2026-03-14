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