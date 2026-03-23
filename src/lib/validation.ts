import { z } from "zod";

const imageUrlSchema = z.preprocess(
  (value) => {
    if (typeof value === "string" && value.trim() === "") {
      return undefined;
    }
    return value;
  },
  z
    .union([z.string().url(), z.string().regex(/^\/[^\s]+$/)])
    .optional()
    .nullable()
);

export const brandCreateSchema = z.object({
  name: z.string().min(1),
  nameZh: z.string().optional().nullable(),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  descriptionZh: z.string().optional().nullable(),
  logoUrl: imageUrlSchema,
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const brandUpdateSchema = brandCreateSchema.partial();

export const categoryCreateSchema = z.object({
  name: z.string().min(1),
  nameZh: z.string().optional().nullable(),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  descriptionZh: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export const productCreateSchema = z.object({
  brandId: z.string().min(1),
  categoryId: z.string().min(1),
  name: z.string().min(1),
  nameZh: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  descriptionZh: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  shortDescriptionZh: z.string().optional().nullable(),
  basePrice: z.number().positive(),
  maxPrice: z.number().positive().optional().nullable(),
  currency: z.string().optional(),
  fuelType: z.string().optional().nullable(),
  enginePower: z.number().int().optional().nullable(),
  wheelbase: z.number().int().optional().nullable(),
  driveType: z.string().optional().nullable(),
  cargoLengthMm: z.number().int().optional().nullable(),
  cargoVolumeCubicM: z.number().optional().nullable(),
  batteryCapacityKwh: z.number().int().optional().nullable(),
  emissionStandard: z.string().optional().nullable(),
  weightKg: z.number().int().optional().nullable(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const productUpdateSchema = productCreateSchema.partial();

export const articleCreateSchema = z.object({
  title: z.string().min(1),
  titleZh: z.string().optional().nullable(),
  excerpt: z.string().optional().nullable(),
  excerptZh: z.string().optional().nullable(),
  content: z.string().min(1),
  contentZh: z.string().optional().nullable(),
  coverImage: imageUrlSchema,
  categoryId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  publishedAt: z.string().datetime().optional().nullable(),
});

export const articleUpdateSchema = articleCreateSchema.partial();

export const inquiryCreateSchema = z.object({
  productId: z.string().min(1),
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  message: z.string().optional().nullable(),
});

export const inquiryStatusSchema = z.object({
  status: z.enum(["PENDING", "FOLLOWING", "WAITING_REPLY", "INTERESTED", "CONVERTED", "ABANDONED"]),
  tag: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
  intentNotes: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  nextFollowUpAt: z.string().datetime().optional().nullable(),
  abandonReason: z.string().optional().nullable(),
});

export const inquiryIntentSchema = z.object({
  tag: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
  intentNotes: z.string().optional().nullable(),
  nextFollowUpAt: z.string().datetime().optional().nullable(),
  abandonReason: z.string().optional().nullable(),
  followUpNote: z.string().optional().nullable(),
});

export const adminLoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const adminChangePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

export const adminCreateUserSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "SUPER_ADMIN"]).optional(),
});

export const adminUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export const adminUserPasswordSchema = z.object({
  newPassword: z.string().min(6),
});

export const settingsUpdateSchema = z.object({
  items: z.array(
    z.object({
      key: z.string().min(1),
      value: z.string(),
      type: z.string().optional(),
      group: z.string().optional().nullable(),
      label: z.string().optional().nullable(),
      labelZh: z.string().optional().nullable(),
      description: z.string().optional().nullable(),
    })
  ),
});
