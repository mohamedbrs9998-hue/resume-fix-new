import { z } from 'zod';

const allowedPlans = ['basic', 'pro', 'premium'];

export const orderFormSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  targetRole: z.string().trim().min(2).max(120),
  targetCountry: z.string().trim().min(2).max(120),
  plan: z.enum(allowedPlans),
  jobDescription: z.string().trim().max(6000).optional().default(''),
});

export function sanitizeFilenamePart(value, fallback = 'document') {
  return String(value || fallback)
    .replace(/[^a-zA-Z0-9-_ ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80) || fallback;
}
