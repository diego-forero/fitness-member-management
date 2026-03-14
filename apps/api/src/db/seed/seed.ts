import { eq } from "drizzle-orm";
import { db, pool } from "../client";
import { plans } from "../schema";

async function seed() {
  const existingPlan = await db.query.plans.findFirst({
    where: eq(plans.code, "MONTHLY_BASIC"),
  });

  if (!existingPlan) {
    await db.insert(plans).values({
      code: "MONTHLY_BASIC",
      name: "Monthly Basic",
      description: "Basic monthly membership plan",
      isActive: true,
    });
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