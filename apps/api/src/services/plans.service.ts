import { AppError } from "../errors/app-error";
import {
  createPlan,
  deletePlanById,
  findPlanByCode,
  findPlanById,
  findPlanByName,
  listActivePlans,
  listAllPlans,
  planHasMemberships,
  updatePlanById,
} from "../repositories/plans.repository";

type CreatePlanInput = {
  code: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
};

type UpdatePlanInput = {
  code?: string;
  name?: string;
  description?: string | null;
  isActive?: boolean;
};

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

function normalizeName(name: string) {
  return name.trim();
}

function normalizeDescription(description?: string | null) {
  if (description === undefined) {
    return undefined;
  }

  if (description === null) {
    return null;
  }

  const normalizedDescription = description.trim();

  return normalizedDescription.length > 0 ? normalizedDescription : null;
}

function isDatabaseUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

export async function listPlansService() {
  return listActivePlans();
}

export async function listAdminPlansService() {
  return listAllPlans();
}

export async function createPlanService(input: CreatePlanInput) {
  const normalizedCode = normalizeCode(input.code);
  const normalizedName = normalizeName(input.name);
  const normalizedDescription = normalizeDescription(input.description) ?? null;
  const isActive = input.isActive ?? true;

  const existingPlanByCode = await findPlanByCode(normalizedCode);

  if (existingPlanByCode) {
    throw new AppError(409, "Plan code already exists");
  }

  const existingPlanByName = await findPlanByName(normalizedName);

  if (existingPlanByName) {
    throw new AppError(409, "Plan name already exists");
  }

  try {
    return await createPlan({
      code: normalizedCode,
      name: normalizedName,
      description: normalizedDescription,
      isActive,
    });
  } catch (error) {
    if (isDatabaseUniqueViolation(error)) {
      throw new AppError(409, "Plan code or name already exists");
    }

    throw error;
  }
}

export async function updatePlanService(planId: string, input: UpdatePlanInput) {
  const existingPlan = await findPlanById(planId);

  if (!existingPlan) {
    throw new AppError(404, "Plan not found");
  }

  const normalizedCode =
    input.code !== undefined ? normalizeCode(input.code) : undefined;
  const normalizedName =
    input.name !== undefined ? normalizeName(input.name) : undefined;
  const normalizedDescription = normalizeDescription(input.description);

  if (
    normalizedCode !== undefined &&
    normalizedCode !== existingPlan.code
  ) {
    const planWithSameCode = await findPlanByCode(normalizedCode);

    if (planWithSameCode && planWithSameCode.id !== existingPlan.id) {
      throw new AppError(409, "Plan code already exists");
    }
  }

  if (
    normalizedName !== undefined &&
    normalizedName !== existingPlan.name
  ) {
    const planWithSameName = await findPlanByName(normalizedName);

    if (planWithSameName && planWithSameName.id !== existingPlan.id) {
      throw new AppError(409, "Plan name already exists");
    }
  }

  const hasChanges =
    normalizedCode !== undefined ||
    normalizedName !== undefined ||
    normalizedDescription !== undefined ||
    input.isActive !== undefined;

  if (!hasChanges) {
    throw new AppError(400, "At least one field must be provided");
  }

  try {
    const updatedPlan = await updatePlanById(planId, {
      ...(normalizedCode !== undefined ? { code: normalizedCode } : {}),
      ...(normalizedName !== undefined ? { name: normalizedName } : {}),
      ...(normalizedDescription !== undefined
        ? { description: normalizedDescription }
        : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    });

    if (!updatedPlan) {
      throw new AppError(404, "Plan not found");
    }

    return updatedPlan;
  } catch (error) {
    if (isDatabaseUniqueViolation(error)) {
      throw new AppError(409, "Plan code or name already exists");
    }

    throw error;
  }
}

export async function deletePlanService(planId: string) {
  const existingPlan = await findPlanById(planId);

  if (!existingPlan) {
    throw new AppError(404, "Plan not found");
  }

  if (await planHasMemberships(planId)) {
    throw new AppError(
      409,
      "Plan cannot be deleted because it has memberships",
    );
  }

  await deletePlanById(planId);
}
