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
- Password: `admin123`

首次登录后请立即修改密码。

## 关键路由

- 前台：`/` `/products` `/products/[slug]` `/about` `/contact`
- 后台：`/admin/login` `/admin/dashboard` `/admin/products` `/admin/inquiries` `/admin/settings` `/admin/users`

## API 入口

- Public：`/api/products` `/api/brands` `/api/categories` `/api/fuel-types` `/api/drive-types` `/api/settings` `/api/inquiries`
- Admin：`/api/admin/*`、`/api/inquiries/*`（管理动作需 Bearer Token）

具体接口见：`docs/backend-api.md`
