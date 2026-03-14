import { z } from "zod";

export const createMemberBodySchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
});

export const listMembersQuerySchema = z.object({
  query: z.string().trim().max(255).optional(),
});

export const memberIdParamSchema = z.object({
  memberId: z.string().uuid(),
});

export type CreateMemberBody = z.infer<typeof createMemberBodySchema>;
export type ListMembersQuery = z.infer<typeof listMembersQuerySchema>;
export type MemberIdParams = z.infer<typeof memberIdParamSchema>;