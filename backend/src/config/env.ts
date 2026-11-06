import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:5173,http://localhost:3000,capacitor://localhost,https://localhost')
    .transform((val) => val.split(',').map((s) => s.trim())),
  STATIC_QRIS_PAYLOAD: z
    .string()
    .min(20, 'STATIC_QRIS_PAYLOAD must be a valid EMVCo QRIS string'),
  STORAGE_DIR: z.string().default('./storage'),
  ORDER_EXPIRY_MINUTES: z.coerce.number().default(30),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
