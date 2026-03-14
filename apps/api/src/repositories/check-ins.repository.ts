import { db } from "../db/client";
import { checkIns } from "../db/schema";

export async function createCheckIn(membershipId: string) {
  const [checkIn] = await db
    .insert(checkIns)
    .values({
      membershipId,
    })
    .returning({
      id: checkIns.id,
      membershipId: checkIns.membershipId,
      checkedInAt: checkIns.checkedInAt,
    });

  return checkIn;
}