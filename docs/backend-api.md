# 后端 API 文档（当前实现）

项目：truck-merged-project  
技术栈：Next.js 14 + Prisma + PostgreSQL  
状态：Lead-only（文章与订单模块已下线）

## 统一响应结构

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

## 认证

- 管理端登录：`POST /api/admin/auth/login`
- 管理端改密：`PATCH /api/admin/auth/change-password`
- 管理接口使用：`Authorization: Bearer <token>`
- 权限模型：`ADMIN` / `SUPER_ADMIN`

## Public API

- `GET /api/products`
- `GET /api/products/[id|slug]`
- `GET /api/products/search?q=...`
- `GET /api/brands`
- `GET /api/categories`
- `GET /api/fuel-types`
- `GET /api/drive-types`
- `GET /api/settings`
- `POST /api/inquiries`

## Admin API

### 产品

- `POST /api/products`
- `PUT /api/products/[id|slug]`
- `DELETE /api/products/[id|slug]`
- `POST /api/products/[id|slug]/images/upload`
- `POST /api/products/[id|slug]/images/url`
- `DELETE /api/products/[id|slug]/images/[imageId]`

### 品牌 / 分类

- `POST /api/brands`
- `PUT /api/brands/[id|slug]`
- `DELETE /api/brands/[id|slug]`
- `POST /api/categories`
- `PUT /api/categories/[id|slug]`
- `DELETE /api/categories/[id|slug]`

### 燃料 / 驱动类型

- `POST /api/fuel-types`
- `PUT /api/fuel-types/[id]`
- `DELETE /api/fuel-types/[id]`
- `POST /api/drive-types`
- `PUT /api/drive-types/[id]`
- `DELETE /api/drive-types/[id]`

### 线索（核心流程）

- `GET /api/inquiries`（管理员，支持分页+筛选）
- `GET /api/inquiries/[id]`
- `PATCH /api/inquiries/[id]/status`
- `PATCH /api/inquiries/[id]/intent`
- `DELETE /api/inquiries/[id]`
- `GET /api/inquiries/export`（CSV 导出，管理员）

线索状态：

- `PENDING`
- `FOLLOWING`
- `WAITING_REPLY`
- `INTERESTED`
- `CONVERTED`
- `ABANDONED`

线索标签：

- `HIGH`
- `MEDIUM`
- `LOW`

### 管理员与站点设置

- `GET /api/admin/users`
- `POST /api/admin/users`（SUPER_ADMIN）
- `PATCH /api/admin/users/[id]/status`（SUPER_ADMIN）
- `PATCH /api/admin/users/[id]/password`（SUPER_ADMIN）
- `DELETE /api/admin/users/[id]`（SUPER_ADMIN）
- `GET /api/admin/settings`
- `PUT /api/admin/settings`

### 文件上传

- `POST /api/upload`

## 说明

- 删除动作由前端管理端统一二次确认后发起。
- 真实接口契约以 `src/app/api/**/route.ts` 为最终准。
