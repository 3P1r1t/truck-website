"use client";

import useSWR, { mutate } from "swr";
import type {
  ApiEnvelope,
  AdminUser,
  Brand,
  Category,
  DriveTypeOption,
  FuelTypeOption,
  Inquiry,
  Product,
  SettingItem,
} from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";
const ADMIN_TOKEN_KEY = "truck_admin_jwt";

export function getAdminToken() {
  if (typeof window === "undefined") {
    return "";
  }
  return localStorage.getItem(ADMIN_TOKEN_KEY) || "";
}

export function setAdminToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  }
}

export function clearAdminToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  }
}

async function request<T>(path: string, options: RequestInit = {}, useAdminAuth = false) {
  const headers = new Headers(options.headers || {});
  const isFormData = options.body instanceof FormData;
  if (!isFormData) {
    headers.set("Content-Type", headers.get("Content-Type") || "application/json");
  }

  if (useAdminAuth) {
    const token = getAdminToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!response.ok || !payload || payload.code !== 0) {
    throw new Error(payload?.message || "Request failed");
  }

  return {
    data: payload.data,
    pagination: payload.pagination,
  };
}

async function fetcher<T>(path: string) {
  const { data } = await request<T>(path, {}, false);
  return data;
}

async function fetcherWithMeta<T>(path: string) {
  return request<T>(path, {}, false);
}

function withLang(path: string, lang?: string) {
  if (!lang) {
    return path;
  }
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}lang=${lang}`;
}

export function useProducts(params?: {
  lang?: string;
  page?: number;
  pageSize?: number;
  search?: string;
  brandId?: string;
  categoryId?: string;
  fuelType?: string;
  featured?: boolean;
  includeInactive?: boolean;
}) {
  const searchParams = new URLSearchParams();
  if (params?.lang) searchParams.set("lang", params.lang);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
  if (params?.search) searchParams.set("search", params.search);
  if (params?.brandId) searchParams.set("brandId", params.brandId);
  if (params?.categoryId) searchParams.set("categoryId", params.categoryId);
  if (params?.fuelType) searchParams.set("fuelType", params.fuelType);
  if (params?.featured) searchParams.set("featured", "true");
  if (params?.includeInactive) searchParams.set("includeInactive", "true");

  const key = `/products${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const { data, error, isLoading } = useSWR(key, fetcherWithMeta<Product[]>);

  return {
    products: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate: () => mutate(key),
  };
}

export function useProduct(identifier: string, lang?: string) {
  const key = identifier ? withLang(`/products/${identifier}`, lang) : null;
  const { data, error, isLoading } = useSWR(key, fetcher<Product>);

  return {
    product: data,
    isLoading,
    isError: error,
    mutate: () => key && mutate(key),
  };
}

export function useBrands(lang?: string, includeInactive = false) {
  const key = withLang(`/brands${includeInactive ? "?includeInactive=true" : ""}`, lang);
  const { data, error, isLoading } = useSWR(key, fetcher<Brand[]>);
  return {
    brands: data || [],
    isLoading,
    isError: error,
    mutate: () => mutate(key),
  };
}

export function useCategories(lang?: string, includeChildren = true, includeInactive = false) {
  const searchParams = new URLSearchParams();
  searchParams.set("includeChildren", includeChildren ? "true" : "false");
  if (includeInactive) {
    searchParams.set("includeInactive", "true");
  }

  const key = withLang(`/categories?${searchParams.toString()}`, lang);
  const { data, error, isLoading } = useSWR(key, fetcher<Category[]>);
  return {
    categories: data || [],
    isLoading,
    isError: error,
    mutate: () => mutate(key),
  };
}

export function useFuelTypes(lang?: string) {
  const key = withLang("/fuel-types", lang);
  const { data, error, isLoading } = useSWR(key, fetcher<FuelTypeOption[]>);
  return {
    fuelTypes: data || [],
    isLoading,
    isError: error,
    mutate: () => mutate(key),
  };
}

export function useDriveTypes(lang?: string) {
  const key = withLang("/drive-types", lang);
  const { data, error, isLoading } = useSWR(key, fetcher<DriveTypeOption[]>);
  return {
    driveTypes: data || [],
    isLoading,
    isError: error,
    mutate: () => mutate(key),
  };
}

export function useSettings(lang?: string, group?: string) {
  const path = `/settings${group ? `?group=${group}` : ""}`;
  const key = withLang(path, lang);
  const { data, error, isLoading } = useSWR(key, fetcher<Record<string, string>>);

  return {
    settings: data || {},
    isLoading,
    isError: error,
    mutate: () => mutate(key),
  };
}

export function useInquiriesAdmin(params?: {
  page?: number;
  pageSize?: number;
  status?: Inquiry["status"];
  statuses?: Inquiry["status"][];
  tag?: Inquiry["tag"];
  dateFrom?: string;
  dateTo?: string;
  lang?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.lang) searchParams.set("lang", params.lang);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
  if (params?.status) searchParams.set("status", params.status);
  if (params?.statuses && params.statuses.length > 0) searchParams.set("statuses", params.statuses.join(","));
  if (params?.tag) searchParams.set("tag", params.tag);
  if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom);
  if (params?.dateTo) searchParams.set("dateTo", params.dateTo);

  const key = `/inquiries${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const { data, error, isLoading } = useSWR(key, async (url: string) => request<Inquiry[]>(url, {}, true));

  return {
    inquiries: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate: () => mutate(key),
  };
}

export async function adminLogin(username: string, password: string) {
  const { data } = await request<{ token: string; admin: AdminUser }>(
    "/admin/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ username, password }),
    },
    false
  );

  setAdminToken(data.token);
  return data;
}

export async function adminChangePassword(currentPassword: string, newPassword: string) {
  const { data } = await request<{ id: string }>(
    "/admin/auth/change-password",
    {
      method: "PATCH",
      body: JSON.stringify({ currentPassword, newPassword }),
    },
    true
  );
  return data;
}

export async function adminGetUsers() {
  const { data } = await request<AdminUser[]>("/admin/users", {}, true);
  return data;
}

export async function adminCreateUser(payload: {
  username: string;
  email: string;
  password: string;
  role: "ADMIN" | "SUPER_ADMIN";
}) {
  const { data } = await request<AdminUser>(
    "/admin/users",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    true
  );
  return data;
}

export async function adminUpdateUserStatus(id: string, isActive: boolean) {
  const { data } = await request<AdminUser>(
    `/admin/users/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    },
    true
  );
  return data;
}

export async function adminResetUserPassword(id: string, newPassword: string) {
  const { data } = await request<AdminUser>(
    `/admin/users/${id}/password`,
    {
      method: "PATCH",
      body: JSON.stringify({ newPassword }),
    },
    true
  );
  return data;
}

export async function adminDeleteUser(id: string) {
  await request<{ id: string }>(`/admin/users/${id}`, { method: "DELETE" }, true);
}

export async function createProduct(payload: Record<string, unknown>) {
  const { data } = await request<Product>(
    "/products",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    true
  );
  await mutate((key) => typeof key === "string" && key.startsWith("/products"));
  return data;
}

export async function updateProduct(id: string, payload: Record<string, unknown>) {
  const { data } = await request<Product>(
    `/products/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    true
  );
  await mutate((key) => typeof key === "string" && key.startsWith("/products"));
  return data;
}

export async function deleteProduct(id: string) {
  await request<{ id: string }>(`/products/${id}`, { method: "DELETE" }, true);
  await mutate((key) => typeof key === "string" && key.startsWith("/products"));
}

export async function uploadProductImage(productId: string, file: File, imageType: "main" | "detail", altText?: string) {
  const token = getAdminToken();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("imageType", imageType);
  if (altText) {
    formData.append("altText", altText);
  }

  const response = await fetch(`${API_BASE}/products/${productId}/images/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  const payload = (await response.json()) as ApiEnvelope<unknown>;
  if (!response.ok || payload.code !== 0) {
    throw new Error(payload.message || "Upload failed");
  }

  await mutate((key) => typeof key === "string" && key.startsWith("/products"));
  return payload.data;
}

export async function uploadAsset(file: File, folder = "general", settingKey?: string) {
  const token = getAdminToken();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  if (settingKey) {
    formData.append("settingKey", settingKey);
  }

  const response = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<{
    filename: string;
    path: string;
    size: number;
    mimeType: string;
  }> | null;

  if (!response.ok || !payload || payload.code !== 0) {
    throw new Error(payload?.message || "Upload failed");
  }

  return payload.data;
}

export async function addProductImageByUrl(productId: string, payload: { imageUrl: string; imageType: "main" | "detail"; altText?: string }) {
  const { data } = await request(
    `/products/${productId}/images/url`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    true
  );
  await mutate((key) => typeof key === "string" && key.startsWith("/products"));
  return data;
}

export async function deleteProductImage(productId: string, imageId: string) {
  await request(`/products/${productId}/images/${imageId}`, { method: "DELETE" }, true);
  await mutate((key) => typeof key === "string" && key.startsWith("/products"));
}

export async function createBrand(payload: Record<string, unknown>) {
  const { data } = await request<Brand>(
    "/brands",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    true
  );
  await mutate((key) => typeof key === "string" && key.startsWith("/brands"));
  return data;
}

export async function updateBrand(id: string, payload: Record<string, unknown>) {
  const { data } = await request<Brand>(
    `/brands/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    true
  );
  await mutate((key) => typeof key === "string" && key.startsWith("/brands"));
  return data;
}

export async function deleteBrand(id: string) {
  await request(`/brands/${id}`, { method: "DELETE" }, true);
  await mutate((key) => typeof key === "string" && key.startsWith("/brands"));
}

export async function createCategory(payload: Record<string, unknown>) {
  const { data } = await request<Category>(
    "/categories",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    true
  );
  await mutate((key) => typeof key === "string" && key.startsWith("/categories"));
  return data;
}

export async function updateCategory(id: string, payload: Record<string, unknown>) {
  const { data } = await request<Category>(
    `/categories/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    true
  );
  await mutate((key) => typeof key === "string" && key.startsWith("/categories"));
  return data;
}

export async function deleteCategory(id: string) {
  await request(`/categories/${id}`, { method: "DELETE" }, true);
  await mutate((key) => typeof key === "string" && key.startsWith("/categories"));
}

export async function createFuelType(payload: { name: string; nameZh?: string; slug?: string }) {
  const { data } = await request<FuelTypeOption>(
    "/fuel-types",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    true
  );
  await mutate((key) => typeof key === "string" && key.startsWith("/fuel-types"));
  return data;
}

export async function updateFuelType(id: string, payload: { name?: string; nameZh?: string; slug?: string }) {
  const { data } = await request<FuelTypeOption>(
    `/fuel-types/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    true
  );
  await mutate((key) => typeof key === "string" && key.startsWith("/fuel-types"));
  return data;
}

export async function deleteFuelType(id: string) {
  await request(`/fuel-types/${id}`, { method: "DELETE" }, true);
  await mutate((key) => typeof key === "string" && key.startsWith("/fuel-types"));
}

export async function createDriveType(payload: { name: string; nameZh?: string; slug?: string }) {
  const { data } = await request<DriveTypeOption>(
    "/drive-types",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    true
  );
  await mutate((key) => typeof key === "string" && key.startsWith("/drive-types"));
  return data;
}

export async function updateDriveType(id: string, payload: { name?: string; nameZh?: string; slug?: string }) {
  const { data } = await request<DriveTypeOption>(
    `/drive-types/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    true
  );
  await mutate((key) => typeof key === "string" && key.startsWith("/drive-types"));
  return data;
}

export async function deleteDriveType(id: string) {
  await request(`/drive-types/${id}`, { method: "DELETE" }, true);
  await mutate((key) => typeof key === "string" && key.startsWith("/drive-types"));
}

export async function submitInquiry(payload: {
  productId?: string;
  sourceType?: "GENERAL" | "PRODUCT";
  fullName?: string;
  email: string;
  phone?: string;
  country?: string;
  message?: string;
}) {
  const { data } = await request<Inquiry>(
    "/inquiries",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    false
  );
  return data;
}

export async function updateInquiryStatus(id: string, status: Inquiry["status"]) {
  const { data } = await request<Inquiry>(
    `/inquiries/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
    true
  );
  await mutate((key) => typeof key === "string" && key.startsWith("/inquiries"));
  return data;
}

export async function updateInquiryWorkflow(
  id: string,
  payload: {
    status: Inquiry["status"];
    tag?: Inquiry["tag"];
    intentNotes?: string;
    note?: string;
    nextFollowUpAt?: string | null;
    abandonReason?: string;
  }
) {
  const { data } = await request<Inquiry>(
    `/inquiries/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
    true
  );
  await mutate((key) => typeof key === "string" && key.startsWith("/inquiries"));
  return data;
}

export async function updateInquiryIntent(
  id: string,
  payload: {
    tag?: Inquiry["tag"];
    intentNotes?: string;
    nextFollowUpAt?: string | null;
    abandonReason?: string;
    followUpNote?: string;
  }
) {
  const { data } = await request<Inquiry>(
    `/inquiries/${id}/intent`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
    true
  );
  await mutate((key) => typeof key === "string" && key.startsWith("/inquiries"));
  return data;
}

export async function deleteInquiry(id: string) {
  await request(`/inquiries/${id}`, { method: "DELETE" }, true);
  await mutate((key) => typeof key === "string" && key.startsWith("/inquiries"));
}

export async function downloadInquiriesCsv(params?: {
  status?: Inquiry["status"];
  statuses?: Inquiry["status"][];
  tag?: Inquiry["tag"];
  dateFrom?: string;
  dateTo?: string;
  lang?: "en" | "zh";
}) {
  const token = getAdminToken();
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.statuses && params.statuses.length > 0) searchParams.set("statuses", params.statuses.join(","));
  if (params?.tag) searchParams.set("tag", params.tag);
  if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom);
  if (params?.dateTo) searchParams.set("dateTo", params.dateTo);
  if (params?.lang) searchParams.set("lang", params.lang);

  const response = await fetch(
    `${API_BASE}/inquiries/export${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
    {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  );

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ApiEnvelope<null> | null;
    throw new Error(payload?.message || "Failed to export CSV");
  }

  return response.blob();
}

export async function adminGetSettings(group?: string) {
  const path = `/admin/settings${group ? `?group=${encodeURIComponent(group)}` : ""}`;
  const { data } = await request<SettingItem[]>(path, {}, true);
  return data;
}

export async function adminUpdateSettings(items: SettingItem[]) {
  const { data } = await request<SettingItem[]>(
    "/admin/settings",
    {
      method: "PUT",
      body: JSON.stringify({ items }),
    },
    true
  );
  await mutate((key) => typeof key === "string" && key.startsWith("/settings"));
  await mutate((key) => typeof key === "string" && key.startsWith("/admin/settings"));
  return data;
}
