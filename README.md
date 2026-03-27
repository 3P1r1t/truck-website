# truck-merged-project

单体 Next.js 站点（前台 C 端 + 后台 B 端），用于商用车展示与线索管理。

## 技术栈

- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- JWT（管理端认证）

## 当前业务范围

- 产品/品牌/分类/燃料类型/驱动类型管理
- 产品图片上传与 URL 图片管理
- 前台线索提交（表单 + WhatsApp）
- 后台线索管理（状态流转、意向标签、跟进记录）
- 线索筛选（日期/意向/成交/战败）
- 线索 CSV 导出
- 新线索入池提示（管理端提醒 + 提示音）
- 站点文案配置（中英）
- 管理员管理（创建/启停/重置密码/删除）

说明：文章系统与订单系统已下线。

## 快速开始

1. 安装依赖

```bash
npm install
```

2. 配置环境变量

```bash
cp .env.example .env
```

3. 生成 Prisma Client 并执行迁移

```bash
npm run db:generate
npm run db:migrate
```

4. 初始化种子数据

```bash
npm run db:seed
```

5. 启动开发环境

```bash
npm run dev
```

## 默认管理员

- Username: `admin`
- Password: `.env` 中的 `ADMIN_SEED_PASSWORD`

首次登录后请立即修改密码。

## 关键路由

- 前台：`/` `/products` `/products/[slug]` `/about` `/contact`
- 后台：`/admin/login` `/admin/dashboard` `/admin/products` `/admin/inquiries` `/admin/settings` `/admin/users`

## API 入口

- Public：`/api/products` `/api/brands` `/api/categories` `/api/fuel-types` `/api/drive-types` `/api/settings` `/api/inquiries`
- Admin：`/api/admin/*`、`/api/inquiries/*`（管理动作需 Bearer Token）

具体接口见：`docs/backend-api.md`

## 部署到 Vercel + Supabase + Cloudflare R2

### 1) Cloudflare R2 准备

- 创建 Bucket（例如 `truck-assets`）
- 为 Bucket 绑定可公开访问域名（推荐自定义域名），记为 `R2_PUBLIC_BASE_URL`
- 创建 API Token（需包含该 Bucket 的 `Object Read/Write`）
- 给 Bucket 配置 CORS（前端直传必须）

示例 CORS：

```json
[
  {
    "AllowedOrigins": ["https://your-vercel-domain.vercel.app", "https://your-production-domain.com"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

### 2) Supabase 准备

- 在 Supabase 创建 Postgres 项目
- 获取 `DATABASE_URL` 和 `DIRECT_URL`（Prisma 使用）
- 确认数据库网络策略允许 Vercel 访问

### 3) Vercel 环境变量

在 Vercel 项目 `Settings -> Environment Variables` 配置：

- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `ADMIN_SEED_PASSWORD`
- `NEXT_PUBLIC_API_URL`（通常填 `/api`）
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `R2_PUBLIC_BASE_URL`
- `MAX_UPLOAD_SIZE`（可选，单位字节）

### 4) Prisma 迁移与种子

首次部署前执行：

```bash
npm install
npm run db:generate
npm run db:deploy
npm run db:seed
```

生产环境后续发布只需：

```bash
npm run db:deploy
```

### 5) 上传链路说明（当前实现）

- 管理端先请求后端 `/api/upload` 获取 R2 签名 URL
- 浏览器直接 `PUT` 文件到 R2
- 前端将返回的公共 URL 写入设置或产品图片记录
- 删除产品图片时会同步尝试删除 R2 对象

### 6) 上线后核验

- 后台 `admin/settings` 上传首页主视觉图片/视频，确认可回显
- 后台 `admin/products` 上传主图/详情图，确认前台可显示
- 删除产品图片后，R2 对象应同步删除
- 访问 `/api/admin/auth/change-password`，确认 Prisma 连接正常
