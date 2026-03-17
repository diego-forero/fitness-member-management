import { eq } from "drizzle-orm";
import { db, pool } from "../client";
import { plans } from "../schema";

const defaultPlans = [
  {
    code: "MONTHLY_BASIC",
    name: "Monthly Basic",
    description: "Basic monthly membership plan",
    isActive: true,
  },
  {
    code: "MONTHLY_PLUS",
    name: "Monthly Plus",
    description: "Premium monthly membership plan",
    isActive: true,
  },
] as const;

async function seed() {
  for (const plan of defaultPlans) {
    const existingPlan = await db.query.plans.findFirst({
      where: eq(plans.code, plan.code),
    });

    if (!existingPlan) {
      await db.insert(plans).values(plan);
    }
  }

  console.log("Seed completed");
}

seed()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
