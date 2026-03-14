import { sql } from "drizzle-orm";
import {
  check,
  index,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { members } from "./members";
import { plans } from "./plans";

export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "restrict" }),

    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "restrict" }),

    startsAt: timestamp("starts_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),

    cancellationEffectiveAt: timestamp("cancellation_effective_at", {
      withTimezone: true,
      mode: "date",
    }),

    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    membershipsMemberIndex: index("memberships_member_id_idx").on(table.memberId),
    membershipsPlanIndex: index("memberships_plan_id_idx").on(table.planId),
    membershipsStartsAtIndex: index("memberships_starts_at_idx").on(table.startsAt),

    membershipsOneActivePerMemberUnique: uniqueIndex(
      "memberships_one_active_per_member_unique",
    )
      .on(table.memberId)
      .where(sql`${table.cancellationEffectiveAt} IS NULL`),

    membershipsCancellationAfterStartCheck: check(
      "memberships_cancellation_after_start_check",
      sql`${table.cancellationEffectiveAt} IS NULL OR ${table.cancellationEffectiveAt} >= ${table.startsAt}`,
    ),
  }),
);