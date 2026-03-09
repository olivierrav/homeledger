import { z } from "zod";

export const createTierSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
});

export const updateTierSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
});

export type CreateTierInput = z.infer<typeof createTierSchema>;
export type UpdateTierInput = z.infer<typeof updateTierSchema>;
