# Frontend 开发指南（当前实现）

项目：`truck-merged-project`  
框架：Next.js 14 App Router + TypeScript + Tailwind CSS

## 1. 路由结构

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
    admin/
      login/page.tsx
      dashboard/page.tsx
      products/page.tsx
      products/new/page.tsx
      inquiries/page.tsx
      settings/page.tsx
      users/page.tsx

  api/
    ...route handlers
```

后台 URL 统一使用 `/admin/*`，不再保留 `/login`、`/dashboard` 的历史兼容路径。

## 2. 核心前端模块

- `src/lib/api.ts`
  - SWR hooks 与 mutation 封装
  - 管理端 token 读写
- `src/lib/use-locale.ts`
  - 前端语言解析（query/cookie）
- `src/lib/i18n.ts`
  - locale 工具与 `withLangPath`
- `src/components/public/*`
  - 公共站点组件（Header/Footer/ProductCard/Gallery/Contact）
- `src/components/admin/*`
  - 后台组件（Sidebar/Header/Form/Uploader/Dialog）

## 3. 数据流说明

### 3.1 Public 页面

- 页面通过 `useLocale()` 决定语言
- 通过 `useProducts/useSettings` 拉取展示数据
- 询盘通过 `submitInquiry` 发到 `/api/inquiries`

### 3.2 Admin 页面

- `src/app/(admin)/layout.tsx` 负责 token 检查和登录跳转
- 业务操作通过 `src/lib/api.ts` 的 Admin 方法调用
- 列表刷新依赖 SWR `mutate`

## 4. 多语言规则

- 语言：`en | zh`
- URL：`?lang=en|zh`
- 设置项：`key_en/key_zh` 命名（如 `home_hero_title_line1_en`）
- 链接拼接统一用 `withLangPath`

## 5. 上传与媒体

- 上传流程：
  1. 管理端请求 `/api/upload` 获取签名 URL
  2. 浏览器直传到 R2
  3. 将返回的 `path` 写入设置或产品图片
- 保留资源目录：
  - `public/assets/pdf-extract`
  - `public/assets/默认图片`

## 6. 状态与性能实践（已落地）

- 管理端仪表盘改为分页总数统计，不再拉大列表计数
- 线索页轮询仅在可见且在线时进行
- 语言解析改为懒初始化，减少首屏额外渲染
- 产品详情浏览量更新改为非阻塞写入

## 7. 本地开发

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

## 8. 调试建议

- API 调试：直接看 `src/app/api/**/route.ts`
- 前端请求调试：从 `src/lib/api.ts` 入口追踪
- 多语言异常：先检查 URL `lang` 与 `site_lang` cookie
