import { asc, eq } from "drizzle-orm";
import { db } from "../db/client";
import { plans } from "../db/schema";

export async function listActivePlans() {
  return db
    .select({
      id: plans.id,
      code: plans.code,
      name: plans.name,
      description: plans.description,
      isActive: plans.isActive,
      createdAt: plans.createdAt,
      updatedAt: plans.updatedAt,
    })
    .from(plans)
    .where(eq(plans.isActive, true))
    .orderBy(asc(plans.name));
}

export async function findPlanById(planId: string) {
  const [plan] = await db
    .select({
      id: plans.id,
      code: plans.code,
      name: plans.name,
      description: plans.description,
      isActive: plans.isActive,
      createdAt: plans.createdAt,
      updatedAt: plans.updatedAt,
    })
    .from(plans)
    .where(eq(plans.id, planId))
    .limit(1);

  return plan ?? null;
}