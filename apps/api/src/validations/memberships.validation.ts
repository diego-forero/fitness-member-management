import { z } from "zod";

export const assignMembershipBodySchema = z.object({
  planId: z.string().uuid(),
  startDate: z.coerce.date(),
});

export type AssignMembershipBody = z.infer<typeof assignMembershipBodySchema>;