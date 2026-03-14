import { index, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { memberships } from "./memberships";

export const checkIns = pgTable(
  "check_ins",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    membershipId: uuid("membership_id")
      .notNull()
      .references(() => memberships.id, { onDelete: "restrict" }),

    checkedInAt: timestamp("checked_in_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    checkInsMembershipIndex: index("check_ins_membership_id_idx").on(table.membershipId),
    checkInsCheckedInAtIndex: index("check_ins_checked_in_at_idx").on(table.checkedInAt),
  }),
);