import { z } from "zod";

export const createBudgetSchema = z.object({
  accountId: z.string().uuid(),
  label: z.string().min(1),
  iconKey: z.string().default(""),
  color: z.string().default(""),
  monthlyAmount: z.number(),
  comment: z.string().nullable().optional(),
});

export const updateBudgetSchema = z.object({
  label: z.string().min(1).optional(),
  iconKey: z.string().optional(),
  color: z.string().optional(),
  monthlyAmount: z.number().optional(),
  comment: z.string().nullable().optional(),
});

export const updateBudgetListItemSchema = z.object({
  id: z.string().uuid().optional(),
  accountId: z.string().uuid().optional(),
  label: z.string().min(1),
  iconKey: z.string().default(""),
  color: z.string().default(""),
  monthlyAmount: z.number(),
  comment: z.string().nullable().optional(),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
export type UpdateBudgetListItem = z.infer<typeof updateBudgetListItemSchema>;
