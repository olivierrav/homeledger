import { z } from "zod";

export const createAccountSchema = z.object({
  name: z.string().min(1),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  type: z.enum(["current", "savings"]),
  interestRate: z.number().nullable().optional(),
  initialBalance: z.number(),
});

export const updateAccountSchema = z.object({
  name: z.string().min(1).optional(),
  bankName: z.string().nullable().optional(),
  accountNumber: z.string().nullable().optional(),
  type: z.enum(["current", "savings"]).optional(),
  interestRate: z.number().nullable().optional(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
