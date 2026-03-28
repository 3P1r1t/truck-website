# Backend API 文档（当前实现）

项目：`truck-merged-project`  
框架：Next.js Route Handlers + Prisma  
版本状态：Lead-only（文章/订单模块已下线）

## 1. 统一响应格式

成功：

```json
{
  "code": 0,
  "message": "ok",
  "data": {},
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

失败：

```json
{
  "code": 400,
  "message": "Invalid payload",
  "data": null,
  "errors": []
}
```

## 2. 认证与权限

- 登录：`POST /api/admin/auth/login`
- Token：`Authorization: Bearer <token>`
- 角色：`ADMIN` / `SUPER_ADMIN`
- 权限规则：
  - 普通管理：`requireAdmin`
  - 超管操作（管理员创建/删改）：`requireSuperAdmin`

## 3. Public API

### 3.1 Products

- `GET /api/products`
  - Query:
    - `lang=en|zh`
    - `page`, `pageSize`
    - `search`
    - `brandId`, `categoryId`, `fuelType`
    - `featured=true`
    - `includeInactive=true`（仅管理员 token 有效）
- `POST /api/products`（Admin）
- `GET /api/products/:idOrSlug`
- `PUT /api/products/:idOrSlug`（Admin）
- `DELETE /api/products/:idOrSlug`（Admin）
- `GET /api/products/search`
- `GET /api/products/fuel-types`

图片管理（Admin）：
- `POST /api/products/:idOrSlug/images/upload`
- `POST /api/products/:idOrSlug/images/url`
- `DELETE /api/products/:idOrSlug/images/:imageId`

### 3.2 Brands

- `GET /api/brands`
  - Query: `lang`, `page`, `pageSize`, `includeInactive`
- `POST /api/brands`（Admin）
- `GET /api/brands/:idOrSlug`
- `PUT /api/brands/:idOrSlug`（Admin）
- `DELETE /api/brands/:idOrSlug`（Admin）

### 3.3 Categories

- `GET /api/categories`
  - Query: `lang`, `page`, `pageSize`, `parentId`, `includeChildren`, `includeInactive`
- `POST /api/categories`（Admin）
- `GET /api/categories/:idOrSlug`
- `PUT /api/categories/:idOrSlug`（Admin）
- `DELETE /api/categories/:idOrSlug`（Admin）

### 3.4 Fuel / Drive Types

- `GET /api/fuel-types`
- `POST /api/fuel-types`（Admin）
- `PUT /api/fuel-types/:id`（Admin）
- `DELETE /api/fuel-types/:id`（Admin）

- `GET /api/drive-types`
- `POST /api/drive-types`（Admin）
- `PUT /api/drive-types/:id`（Admin）
- `DELETE /api/drive-types/:id`（Admin）

### 3.5 Settings

- `GET /api/settings`
  - Query: `group`

### 3.6 Inquiries（Public Submit）

- `POST /api/inquiries`
  - 支持 `GENERAL` / `PRODUCT` 来源
  - 若未传 `productId` 会回退到首个启用产品

## 4. Admin API

### 4.1 Auth

- `POST /api/admin/auth/login`
  - Body: `username`, `password`
- `PATCH /api/admin/auth/change-password`
  - Body: `currentPassword`, `newPassword`

### 4.2 Admin Users（SUPER_ADMIN）

- `GET /api/admin/users`
- `POST /api/admin/users`
- `PATCH /api/admin/users/:id/status`
- `PATCH /api/admin/users/:id/password`
- `DELETE /api/admin/users/:id`

### 4.3 Site Settings

- `GET /api/admin/settings`
  - Query: `group`
- `PUT /api/admin/settings`
  - Body: `{ items: SettingItem[] }`

### 4.4 Inquiry Workflow

- `GET /api/inquiries`（Admin）
  - Query:
    - `page`, `pageSize`
    - `status` 或 `statuses`（逗号分隔）
    - `tag`
    - `dateFrom`, `dateTo`
    - `productId`
    - `lang`
- `GET /api/inquiries/:id`（Admin）
- `PATCH /api/inquiries/:id/status`（Admin）
- `PATCH /api/inquiries/:id/intent`（Admin）
- `DELETE /api/inquiries/:id`（Admin）
- `GET /api/inquiries/export`（Admin，CSV）

状态枚举：
- `PENDING`
- `FOLLOWING`
- `WAITING_REPLY`
- `INTERESTED`
- `CONVERTED`
- `ABANDONED`

意向标签：
- `HIGH`
- `MEDIUM`
- `LOW`

### 4.5 Upload

- `POST /api/upload`（Admin）
  - 返回签名上传信息（R2）
  - 前端随后直传 `uploadUrl`

## 5. 错误码与常见场景

- `400` 参数错误 / 非法状态流转
- `401` 未登录或 token 无效
- `403` 权限不足（例如非超管操作管理员）
- `404` 资源不存在
- `409` 唯一键冲突（slug/key 重复）或引用冲突
- `500` 服务器错误

## 6. 实现基准

如文档与实现冲突，以 `src/app/api/**/route.ts` 为准。  
建议联调时直接对照对应 route 文件与 `src/lib/validation.ts`。
