# 技术架构（当前实现）

项目：truck-merged-project  
架构：Next.js Monolith（App Router + API Routes）

## 技术栈

- Next.js 14
- React 18
- TypeScript 5
- Tailwind CSS 3
- Prisma 5
- PostgreSQL
- JWT（管理端认证）

## 分层

### 1. Presentation

- Public 页面：主页、产品、关于、联系（线索提交）
- Admin 页面：`/admin/*` 管理控制台

### 2. API

`src/app/api` 下按资源分组：

- products / brands / categories
- fuel-types / drive-types
- inquiries
- settings
- admin/auth / admin/users / admin/settings
- upload

### 3. Data

- Prisma schema：`prisma/schema.prisma`
- 迁移：`prisma/migrations/*`
- 种子：`prisma/seed.ts`

## 认证与权限

- 登录接口签发 JWT
- Bearer Token 访问管理接口
- 角色：`ADMIN` / `SUPER_ADMIN`
- 管理端前端路由由 `src/app/(admin)/layout.tsx` 校验 token

## 当前业务边界

- Lead-only：
  - 公共端提交线索
  - 管理端线索跟进、筛选、导出
- 文章模块已移除
- 订单模块已移除

## URL 规范（管理端）

- `/admin/login`
- `/admin/dashboard`
- `/admin/products`
- `/admin/inquiries`
- `/admin/settings`
- `/admin/users`

## 维护约定

- 接口规范以 `src/app/api/**/route.ts` 为最终准
- 文案和多语言站点内容优先通过 `settings` 表管理
- 历史文档如与代码冲突，以代码为准
