import { z } from "zod";

export const assignMembershipBodySchema = z.object({
  planId: z.string().uuid(),
  startDate: z.coerce.date(),
});

export const membershipParamsSchema = z.object({
  memberId: z.string().uuid(),
  membershipId: z.string().uuid(),
});

export type AssignMembershipBody = z.infer<typeof assignMembershipBodySchema>;
export type MembershipParams = z.infer<typeof membershipParamsSchema>;