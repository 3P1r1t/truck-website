export type Locale = "en" | "zh";

export type Brand = {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  nameZh?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  descriptionZh?: string | null;
  logoUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  nameZh?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  descriptionZh?: string | null;
  parentId?: string | null;
  isActive: boolean;
  sortOrder: number;
};

export type FuelTypeOption = {
  id: string;
  key: string;
  name: string;
  nameEn: string;
  nameZh?: string | null;
};

export type DriveTypeOption = {
  id: string;
  key: string;
  name: string;
  nameEn: string;
  nameZh?: string | null;
};

export type ProductImage = {
  id: string;
  url: string;
  altText?: string | null;
  isPrimary: boolean;
  sortOrder: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  nameZh?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  descriptionZh?: string | null;
  shortDescription?: string | null;
  shortDescriptionEn?: string | null;
  shortDescriptionZh?: string | null;
  basePrice: number;
  maxPrice: number;
  currency: string;
  fuelType?: string | null;
  enginePower?: number | null;
  wheelbase?: number | null;
  driveType?: string | null;
  cargoLengthMm?: number | null;
  cargoVolumeCubicM?: number | null;
  batteryCapacityKwh?: number | null;
  emissionStandard?: string | null;
  weightKg?: number | null;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  viewCount: number;
  brand: Brand | null;
  category: Category | null;
  images: ProductImage[];
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
};

export type InquiryStatus =
  | "PENDING"
  | "FOLLOWING"
  | "WAITING_REPLY"
  | "INTERESTED"
  | "CONVERTED"
  | "ABANDONED";

export type InquiryTag = "HIGH" | "MEDIUM" | "LOW";

export type InquiryFollowUpLog = {
  at: string;
  adminId: string;
  adminUsername: string;
  fromStatus?: InquiryStatus;
  toStatus?: InquiryStatus;
  note?: string | null;
  nextFollowUpAt?: string | null;
};

export type InquirySourceType = "GENERAL" | "PRODUCT";

export type Inquiry = {
  id: string;
  productId: string;
  fullName: string;
  email: string;
  phone?: string | null;
  country?: string | null;
  message?: string | null;
  sourceType?: InquirySourceType;
  status: InquiryStatus;
  tag: InquiryTag;
  intentNotes?: string | null;
  nextFollowUpAt?: string | null;
  followUpLogs?: InquiryFollowUpLog[] | null;
  abandonReason?: string | null;
  createdAt: string;
  updatedAt: string;
  product?: Pick<Product, "id" | "slug" | "name"> | null;
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  titleEn: string;
  titleZh?: string | null;
  excerpt?: string | null;
  excerptEn?: string | null;
  excerptZh?: string | null;
  content: string;
  contentEn: string;
  contentZh?: string | null;
  coverImage?: string | null;
  categoryId?: string | null;
  isActive: boolean;
  viewCount: number;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  authorId?: string | null;
};

export type SettingItem = {
  id?: string;
  key: string;
  value: string;
  type?: string;
  group?: string | null;
  label?: string | null;
  labelZh?: string | null;
  description?: string | null;
};

export type AdminUser = {
  id: string;
  username: string;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN";
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ApiEnvelope<T> = {
  code: number;
  message: string;
  data: T;
  pagination?: PaginationMeta;
  errors?: unknown;
};


