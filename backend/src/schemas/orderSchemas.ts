import { z } from 'zod';

/**
 * Escapes values targeted for CSV or Excel to prevent CSV/Excel formula injection (CWE-1236).
 * Any cell value starting with '=', '+', '-', '@', tab, or carriage return is prefixed with a single quote.
 */
export function sanitizeForSpreadsheet(value: string | undefined | null): string {
  if (!value) return '';
  const trimmed = value.trim();
  const dangerousPrefixes = ['=', '+', '-', '@', '\t', '\r'];
  if (dangerousPrefixes.some((prefix) => trimmed.startsWith(prefix))) {
    return `'${trimmed}`;
  }
  return trimmed;
}

export const createOrderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .max(50, 'Max 50 loaves per item'),
});

export const createOrderSchema = z.object({
  customer: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters')
      .transform(sanitizeForSpreadsheet),
    whatsapp: z
      .string()
      .trim()
      .regex(
        /^(?:\+62|62|08)[0-9]{8,13}$/,
        'Please enter a valid Indonesian WhatsApp number (e.g., 08123456789 or +628123456789)'
      )
      .transform((val) => {
        // Normalize to international E.164 (+62...)
        if (val.startsWith('+62')) return val;
        if (val.startsWith('62')) return `+${val}`;
        if (val.startsWith('08')) return `+62${val.slice(1)}`;
        return val;
      }),
    email: z
      .string()
      .trim()
      .email('Invalid email address')
      .optional()
      .or(z.literal('')),
    address: z
      .string()
      .trim()
      .max(500, 'Address cannot exceed 500 characters')
      .optional()
      .transform(sanitizeForSpreadsheet),
    notes: z
      .string()
      .trim()
      .max(500, 'Notes cannot exceed 500 characters')
      .optional()
      .transform(sanitizeForSpreadsheet),
  }),
  fulfillment: z.object({
    type: z.enum(['pickup', 'delivery']),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  }),
  items: z
    .array(createOrderItemSchema)
    .min(1, 'Order must contain at least one bread item'),
  source: z.enum(['web', 'android']).default('web'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
