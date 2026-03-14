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
});