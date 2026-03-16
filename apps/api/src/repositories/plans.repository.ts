import { asc, eq } from "drizzle-orm";
import { db } from "../db/client";
import { memberships, plans } from "../db/schema";

const planSelection = {
  id: plans.id,
  code: plans.code,
  name: plans.name,
  description: plans.description,
  isActive: plans.isActive,
  createdAt: plans.createdAt,
  updatedAt: plans.updatedAt,
};

type CreatePlanInput = {
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
};

type UpdatePlanInput = {
  code?: string;
  name?: string;
  description?: string | null;
  isActive?: boolean;
};

export async function listActivePlans() {
  return db
    .select(planSelection)
    .from(plans)
    .where(eq(plans.isActive, true))
    .orderBy(asc(plans.name));
}

export async function listAllPlans() {
  return db.select(planSelection).from(plans).orderBy(asc(plans.name));
}

export async function findPlanById(planId: string) {
  const [plan] = await db
    .select(planSelection)
    .from(plans)
    .where(eq(plans.id, planId))
    .limit(1);

  return plan ?? null;
}

export async function findPlanByCode(code: string) {
  const [plan] = await db
    .select(planSelection)
    .from(plans)
    .where(eq(plans.code, code))
    .limit(1);

  return plan ?? null;
}

export async function findPlanByName(name: string) {
  const [plan] = await db
    .select(planSelection)
    .from(plans)
    .where(eq(plans.name, name))
    .limit(1);

  return plan ?? null;
}

export async function createPlan(data: CreatePlanInput) {
  const [plan] = await db
    .insert(plans)
    .values({
      code: data.code,
      name: data.name,
      description: data.description,
      isActive: data.isActive,
    })
    .returning(planSelection);

  return plan;
}

export async function updatePlanById(planId: string, data: UpdatePlanInput) {
  const [plan] = await db
    .update(plans)
    .set({
      ...(data.code !== undefined ? { code: data.code } : {}),
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.description !== undefined
        ? { description: data.description }
        : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      updatedAt: new Date(),
    })
    .where(eq(plans.id, planId))
    .returning(planSelection);

  return plan ?? null;
}

export async function planHasMemberships(planId: string) {
  const [membership] = await db
    .select({
      id: memberships.id,
    })
    .from(memberships)
    .where(eq(memberships.planId, planId))
    .limit(1);

  return membership !== undefined;
}

export async function deletePlanById(planId: string) {
  const [plan] = await db
    .delete(plans)
    .where(eq(plans.id, planId))
    .returning(planSelection);

  return plan ?? null;
}
