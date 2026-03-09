import { z } from "zod";

export const createOperationSchema = z.object({
  tierId: z.string().uuid().nullable().optional(),
  dateTime: z.string().datetime(),
  amount: z.number(),
  description: z.string().nullable().optional(),
  budgetId: z.string().uuid().nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  linkedAccountId: z.string().uuid().nullable().optional(),
  type: z
    .enum(["card", "transfer", "deposit", "cheque", "direct_debit", "other"])
    .nullable()
    .optional(),
  imported: z.boolean().optional(),
  status: z.enum(["pending", "posted"]).optional(),
  rawLabel: z.string().nullable().optional(),
  normalizedLabel: z.string().nullable().optional(),
  suggestedTierId: z.string().uuid().nullable().optional(),
  suggestedBudgetId: z.string().uuid().nullable().optional(),
  suggestionConfidence: z.number().min(0).max(1).nullable().optional(),
  suggestionAccepted: z.boolean().nullable().optional(),
});

export const updateOperationSchema = createOperationSchema.partial();

export const bulkCreateOperationsSchema = z.array(createOperationSchema);

export const createReconciliationSchema = z.object({
  date: z.string(),
  balance: z.number(),
  operationIds: z.array(z.string().uuid()),
});

export type CreateOperationInput = z.infer<typeof createOperationSchema>;
export type UpdateOperationInput = z.infer<typeof updateOperationSchema>;
export type CreateReconciliationInput = z.infer<typeof createReconciliationSchema>;
