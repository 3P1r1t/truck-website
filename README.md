# Truck Merged Project

单体 Next.js 项目，包含：
- 前台站点（产品展示、联系与线索收集）
- 后台管理（产品/分类/品牌/燃料/驱动、线索工作流、站点配置、管理员）

当前业务边界：`Lead-only`（文章与订单模块已下线）。

## 1. 技术栈

- Next.js 14（App Router）
- React 18 + TypeScript
- Prisma 5 + PostgreSQL
- JWT（后台认证）
- Tailwind CSS
- Cloudflare R2（直传签名上传）

## 2. 项目结构

```text
src/
  app/
    (public)/              # 前台页面
    (admin)/admin/*        # 后台页面
    api/*                  # API Route
  components/
    public/*               # 前台组件
    admin/*                # 后台组件
  lib/*                    # API 客户端、鉴权、i18n、上传、工具函数

prisma/
  schema.prisma
  migrations/*
  seed.ts

public/
  assets/pdf-extract/*     # 商品 PDF 提取图（保留）
  assets/默认图片/*         # 默认上传图片/视频（保留）
  uploads/.gitkeep
```

## 3. 路由约定

前台：
- `/`
- `/products`
- `/products/[slug]`
- `/about`
- `/contact`

后台：
- `/admin/login`
- `/admin/dashboard`
- `/admin/products`
- `/admin/inquiries`
- `/admin/settings`
- `/admin/users`

说明：
- 历史兼容路径 `/login`、`/dashboard` 已移除，统一使用 `/admin/*`。

## 4. API 总览

Public API：
- `GET /api/products`
- `GET /api/products/:idOrSlug`
- `GET /api/products/search`
- `GET /api/brands`
- `GET /api/categories`
- `GET /api/fuel-types`
- `GET /api/drive-types`
- `GET /api/settings`
- `POST /api/inquiries`

Admin API（Bearer Token）：
- `POST /api/admin/auth/login`
- `PATCH /api/admin/auth/change-password`
- `GET/POST /api/admin/users`
- `PATCH /api/admin/users/:id/status`
- `PATCH /api/admin/users/:id/password`
- `DELETE /api/admin/users/:id`
- `GET/PUT /api/admin/settings`
- 产品/品牌/分类/线索相关管理接口（详见 `docs/backend-api.md`）

## 5. 快速开始

1. 安装依赖

```bash
npm install
```

2. 配置环境变量

```bash
cp .env.example .env
```

3. 数据库

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

4. 启动开发环境

```bash
npm run dev
```

## 6. 环境变量

必须项：
- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `ADMIN_SEED_PASSWORD`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `R2_PUBLIC_BASE_URL`

可选：
- `MAX_UPLOAD_SIZE`（默认 10MB，首页主视觉媒体可绕过大小限制）
- `NEXT_PUBLIC_API_URL`（默认 `/api`）

## 7. 资源管理约定

已保留：
- `public/assets/pdf-extract/*`
- `public/assets/默认图片/*`

已弃用并移除：
- `public/assets/site/*`

## 8. Git 协作与仓库卫生

为避免“本地/云端混乱、临时文件污染提交”，本仓库约定：

- 本地敏感与临时文件不入库（`.env.Production`、`hotfix-*.patch`、`.tmp-*.json` 已忽略）
- 每个优化点单独 commit，避免大杂烩提交
- 合并前先同步远端：

```bash
git fetch --prune
git status -sb
git rebase origin/main
```

- 提交前确认：

```bash
git status --short
```

仅看到你本次改动再提交。

## 9. 文档

- 后端 API 文档：`docs/backend-api.md`
- 前端开发文档：`docs/frontend-guide.md`
