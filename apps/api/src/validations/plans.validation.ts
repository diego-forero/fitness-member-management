import { z } from "zod";

const planCodeSchema = z.string().trim().min(1).max(50);
const planNameSchema = z.string().trim().min(1).max(120);
const planDescriptionSchema = z.string().trim().max(1000);

export const createPlanBodySchema = z.object({
  code: planCodeSchema,
  name: planNameSchema,
  description: planDescriptionSchema.optional().nullable(),
  isActive: z.boolean().optional(),
});

export const updatePlanBodySchema = z
  .object({
    code: planCodeSchema.optional(),
    name: planNameSchema.optional(),
    description: planDescriptionSchema.optional().nullable(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export const planIdParamSchema = z.object({
  planId: z.string().uuid(),
});

export type CreatePlanBody = z.infer<typeof createPlanBodySchema>;
export type UpdatePlanBody = z.infer<typeof updatePlanBodySchema>;
export type PlanIdParams = z.infer<typeof planIdParamSchema>;
