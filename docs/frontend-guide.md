# 前端开发指南（当前实现）

项目：truck-merged-project  
框架：Next.js 14 App Router + TypeScript + Tailwind CSS

## 路由结构

```text
src/app/
  (public)/
    page.tsx
    products/page.tsx
    products/[slug]/page.tsx
    about/page.tsx
    contact/page.tsx

  (admin)/
    layout.tsx
    login/page.tsx              -> redirect /admin/login
    dashboard/page.tsx          -> redirect /admin/dashboard
    admin/
      login/page.tsx            // canonical login
      dashboard/page.tsx
      products/page.tsx
      products/new/page.tsx     -> redirect /admin/products
      inquiries/page.tsx        // 线索管理
      pages/page.tsx            -> redirect /admin/settings
      settings/page.tsx
      users/page.tsx

  api/
    ...resource routes
```

## 管理端 URL 规范

统一使用 `/admin/*`：

- `/admin/login`
- `/admin/dashboard`
- `/admin/products`
- `/admin/inquiries`
- `/admin/settings`
- `/admin/users`

历史路径 `/login`、`/dashboard` 仅保留重定向兼容。

## 功能范围

- 公共站点：产品展示、关于我们、联系与线索提交
- 管理后台：产品相关 CRUD、线索管理、站点配置、管理员管理
- 线索能力：筛选、CSV 导出、新线索提示
- 业务模式：Lead-only（无文章、无订单）

## 国际化约定

- 支持 `en` / `zh`
- 页面通过 `?lang=en|zh` 控制语言
- 站点设置字段使用后缀键，如：`home_hero_title_en` / `home_hero_title_zh`

## 数据与接口

- 前端请求封装：`src/lib/api.ts`
- 类型定义：`src/lib/types.ts`
- API 返回格式：`code/message/data/pagination`
- 真实接口以 `src/app/api/**/route.ts` 为准

## 本地开发

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

## 注意事项

- `.next` 或本地 node 进程占用时，`npm run build` 可能因 `EPERM` 失败。
- 若执行 `npm run lint` 首次出现 Next ESLint 初始化向导，先完成初始化后再继续。
