import request from "supertest";
import { beforeEach, afterAll, describe, expect, it } from "vitest";
import { createApp } from "../app";
import { db, pool } from "../db/client";
import { checkIns, members, memberships, plans } from "../db/schema";

const app = createApp();

let defaultPlanId: string;

describe("member workflow", () => {
  beforeEach(async () => {
    await db.delete(checkIns);
    await db.delete(memberships);
    await db.delete(members);
    await db.delete(plans);

    const [plan] = await db
      .insert(plans)
      .values({
        code: "MONTHLY_BASIC",
        name: "Monthly Basic",
        description: "Basic monthly membership plan",
        isActive: true,
      })
      .returning({
        id: plans.id,
      });

    defaultPlanId = plan.id;
  });

  afterAll(async () => {
    await pool.end();
  });

  it("creates a member, assigns a membership, records a check-in and reflects it in summary", async () => {
    const createMemberResponse = await request(app)
      .post("/api/members")
      .send({
        firstName: "Diego",
        lastName: "Forero",
        email: "diego@test.com",
      });

    expect(createMemberResponse.status).toBe(201);
    expect(createMemberResponse.body.email).toBe("diego@test.com");

    const memberId = createMemberResponse.body.id;

    const assignMembershipResponse = await request(app)
      .post(`/api/members/${memberId}/memberships`)
      .send({
        planId: defaultPlanId,
        startDate: new Date().toISOString().slice(0, 10),
      });

    expect(assignMembershipResponse.status).toBe(201);
    expect(assignMembershipResponse.body.memberId).toBe(memberId);

    const checkInResponse = await request(app).post(
      `/api/members/${memberId}/check-ins`,
    );

    expect(checkInResponse.status).toBe(201);
    expect(checkInResponse.body.memberId).toBe(memberId);

    const summaryResponse = await request(app).get(
      `/api/members/${memberId}/summary`,
    );

    expect(summaryResponse.status).toBe(200);
    expect(summaryResponse.body.hasActiveMembership).toBe(true);
    expect(summaryResponse.body.activeMembership).not.toBeNull();
    expect(summaryResponse.body.activeMembership.plan.id).toBe(defaultPlanId);
    expect(summaryResponse.body.lastCheckInAt).not.toBeNull();
    expect(summaryResponse.body.checkInCountLast30Days).toBe(1);
  });

  it("blocks check-ins after membership cancellation", async () => {
    const createMemberResponse = await request(app)
      .post("/api/members")
      .send({
        firstName: "Laura",
        lastName: "Gomez",
        email: "laura@test.com",
      });

    expect(createMemberResponse.status).toBe(201);

    const memberId = createMemberResponse.body.id;

    const assignMembershipResponse = await request(app)
      .post(`/api/members/${memberId}/memberships`)
      .send({
        planId: defaultPlanId,
        startDate: new Date().toISOString().slice(0, 10),
      });

    expect(assignMembershipResponse.status).toBe(201);

    const membershipId = assignMembershipResponse.body.id;

    const cancelMembershipResponse = await request(app).patch(
      `/api/members/${memberId}/memberships/${membershipId}/cancel`,
    );

    expect(cancelMembershipResponse.status).toBe(200);
    expect(cancelMembershipResponse.body.cancellationEffectiveAt).not.toBeNull();

    const checkInResponse = await request(app).post(
      `/api/members/${memberId}/check-ins`,
    );

    expect(checkInResponse.status).toBe(400);
    expect(checkInResponse.body.message).toBe(
      "Only members with an active membership can check in",
    );
  });

  it("creates an admin-managed plan and keeps the public plans list active-only", async () => {
    const createPlanResponse = await request(app).post("/api/plans").send({
      code: "annual_plus",
      name: "Annual Plus",
      description: "  Premium annual membership  ",
      isActive: false,
    });

    expect(createPlanResponse.status).toBe(201);
    expect(createPlanResponse.body.code).toBe("ANNUAL_PLUS");
    expect(createPlanResponse.body.name).toBe("Annual Plus");
    expect(createPlanResponse.body.description).toBe(
      "Premium annual membership",
    );
    expect(createPlanResponse.body.isActive).toBe(false);

    const publicPlansResponse = await request(app).get("/api/plans");

    expect(publicPlansResponse.status).toBe(200);
    expect(publicPlansResponse.body).toHaveLength(1);
    expect(publicPlansResponse.body[0].id).toBe(defaultPlanId);

    const adminPlansResponse = await request(app).get("/api/plans/admin");

    expect(adminPlansResponse.status).toBe(200);
    expect(adminPlansResponse.body).toHaveLength(2);
    expect(
      adminPlansResponse.body.some(
        (plan: { code: string; isActive: boolean }) =>
          plan.code === "ANNUAL_PLUS" && plan.isActive === false,
      ),
    ).toBe(true);
  });

  it("updates a plan and allows deactivating it", async () => {
    const updatePlanResponse = await request(app)
      .patch(`/api/plans/${defaultPlanId}`)
      .send({
        code: "monthly_basic_plus",
        name: "Monthly Basic Plus",
        description: null,
        isActive: false,
      });

    expect(updatePlanResponse.status).toBe(200);
    expect(updatePlanResponse.body.code).toBe("MONTHLY_BASIC_PLUS");
    expect(updatePlanResponse.body.name).toBe("Monthly Basic Plus");
    expect(updatePlanResponse.body.description).toBeNull();
    expect(updatePlanResponse.body.isActive).toBe(false);

    const publicPlansResponse = await request(app).get("/api/plans");

    expect(publicPlansResponse.status).toBe(200);
    expect(publicPlansResponse.body).toHaveLength(0);
  });

  it("prevents deleting a plan that already has memberships", async () => {
    const createMemberResponse = await request(app)
      .post("/api/members")
      .send({
        firstName: "Sara",
        lastName: "Diaz",
        email: "sara@test.com",
      });

    expect(createMemberResponse.status).toBe(201);

    const memberId = createMemberResponse.body.id;

    const assignMembershipResponse = await request(app)
      .post(`/api/members/${memberId}/memberships`)
      .send({
        planId: defaultPlanId,
        startDate: new Date().toISOString().slice(0, 10),
      });

    expect(assignMembershipResponse.status).toBe(201);

    const deletePlanResponse = await request(app).delete(
      `/api/plans/${defaultPlanId}`,
    );

    expect(deletePlanResponse.status).toBe(409);
    expect(deletePlanResponse.body.message).toBe(
      "Plan cannot be deleted because it has memberships",
    );
  });

  it("deletes a plan that has never been used", async () => {
    const createPlanResponse = await request(app).post("/api/plans").send({
      code: "weekly_trial",
      name: "Weekly Trial",
      description: "Short plan for promos",
    });

    expect(createPlanResponse.status).toBe(201);

    const deletePlanResponse = await request(app).delete(
      `/api/plans/${createPlanResponse.body.id}`,
    );

    expect(deletePlanResponse.status).toBe(204);

    const adminPlansResponse = await request(app).get("/api/plans/admin");

    expect(adminPlansResponse.status).toBe(200);
    expect(
      adminPlansResponse.body.some(
        (plan: { id: string }) => plan.id === createPlanResponse.body.id,
      ),
    ).toBe(false);
  });
});
