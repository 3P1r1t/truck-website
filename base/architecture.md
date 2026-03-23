# 技术架构文档

**项目**: 官网与管理系统开发  
**版本**: 1.0  
**创建时间**: 2026-03-20  
**负责人**: architect

---

## 1. 技术栈选型

### 1.1 前端技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| **Next.js** | 14.x | React 全栈框架，支持 SSR/SSG，SEO 友好 |
| **React** | 18.x | UI 组件库 |
| **Tailwind CSS** | 3.x | 原子化 CSS 框架，快速开发响应式界面 |
| **TypeScript** | 5.x | 类型安全，提升代码质量 |

### 1.2 后端技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| **Next.js API Routes** | 14.x | 轻量级 API 服务，与前端同构 |
| **Prisma ORM** | 5.x | 类型安全的数据库 ORM |
| **PostgreSQL** | 15.x | 主数据库（推荐）或 MySQL 8.x |

### 1.3 基础设施

| 服务 | 推荐方案 | 说明 |
|------|----------|------|
| **图片存储** | AWS S3 / 阿里云 OSS | 对象存储，CDN 加速 |
| **部署** | Vercel / Docker | 一键部署或容器化部署 |
| **缓存** | Redis | 会话管理、热点数据缓存 |

---

## 2. 系统架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────┐
│                      Client Layer                        │
│  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │   官网 (Public)  │  │    管理后台 (Admin)          │  │
│  │   - 首页         │  │    - 产品管理                │  │
│  │   - 产品列表     │  │    - 订单管理                │  │
│  │   - 产品详情     │  │    - 用户管理                │  │
│  │   - 养护指南     │  │    - 内容管理                │  │
│  └─────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Next.js Application                    │
│  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │   Pages (SSR)   │  │      API Routes             │  │
│  │   - /           │  │      - /api/products        │  │
│  │   - /products   │  │      - /api/orders          │  │
│  │   - /articles   │  │      - /api/users           │  │
│  │   - /admin      │  │      - /api/auth            │  │
│  └─────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Data Layer                            │
│  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │   Prisma ORM    │  │    PostgreSQL Database      │  │
│  │   - Schema      │  │    - users                  │  │
│  │   - Client      │  │    - products               │  │
│  │   - Migrations  │  │    - orders                 │  │
│  └─────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  External Services                       │
│  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │   S3 / OSS      │  │      Redis Cache            │  │
│  │   (图片存储)     │  │      (会话/缓存)             │  │
│  └─────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 2.2 目录结构

```
project-root/
├── prisma/
│   ├── schema.prisma      # 数据库 Schema
│   ├── migrations/        # 数据库迁移文件
│   └── seed.ts           # 种子数据
├── src/
│   ├── app/              # Next.js 14 App Router
│   │   ├── (public)/     # 官网页面组
│   │   │   ├── page.tsx
│   │   │   ├── products/
│   │   │   └── articles/
│   │   ├── (admin)/      # 管理后台页面组
│   │   │   ├── admin/
│   │   │   │   ├── products/
│   │   │   │   ├── orders/
│   │   │   │   └── users/
│   │   └── api/          # API 路由
│   ├── components/       # 可复用组件
│   │   ├── ui/           # 基础 UI 组件
│   │   ├── product/      # 产品相关组件
│   │   └── admin/        # 管理后台组件
│   ├── lib/              # 工具库
│   │   ├── prisma.ts     # Prisma 客户端
│   │   ├── utils.ts      # 通用工具函数
│   │   └── auth.ts       # 认证逻辑
│   ├── types/            # TypeScript 类型定义
│   └── styles/           # 全局样式
├── public/               # 静态资源
├── .env                  # 环境变量
└── next.config.js        # Next.js 配置
```

---

## 3. 数据库设计

### 3.1 核心模块

| 模块 | 主要表 | 说明 |
|------|--------|------|
| **用户与权限** | users, admin_logs | 用户账户、角色、操作日志 |
| **产品与 SKU** | products, categories, sku_options, sku_variants | 产品管理、动态 SKU 系统 |
| **订单** | orders, order_items | 订单流程、支付状态 |
| **内容与媒体** | articles, media, product_images | 文章、图片上传管理 |
| **系统配置** | settings | 系统参数配置 |

### 3.2 动态 SKU 设计

采用灵活的属性组合方式支持动态 SKU：

1. **SkuOption**: 定义属性名（如：颜色、尺寸）
2. **SkuOptionValue**: 定义属性值（如：红色、XL）
3. **SkuVariant**: 具体的 SKU 组合（如：红色-XL）
4. **SkuVariantOptionValue**: 关联表，记录 SKU 变体包含哪些属性值

**优势**:
- 支持任意数量的属性维度
- 每个 SKU 变体可独立设置价格和库存
- 可扩展性强，新增属性无需修改表结构

### 3.3 图片上传设计

- 图片统一存储在对象存储（S3/OSS）
- `media` 表记录文件元数据（URL、尺寸、类型等）
- `product_images` 表关联产品与图片
- 支持缩略图自动生成

---

## 4. API 设计规范

### 4.1 RESTful 风格

```
GET    /api/products          # 获取产品列表
GET    /api/products/[slug]   # 获取产品详情
POST   /api/products          # 创建产品（管理员）
PUT    /api/products/[id]     # 更新产品（管理员）
DELETE /api/products/[id]     # 删除产品（管理员）

GET    /api/orders            # 获取订单列表（管理员）
POST   /api/orders            # 创建订单（用户）
GET    /api/orders/[id]       # 获取订单详情

POST   /api/auth/login        # 用户登录
POST   /api/auth/register     # 用户注册
POST   /api/auth/logout       # 用户登出

POST   /api/upload            # 图片上传
```

### 4.2 响应格式

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}
```

---

## 5. 安全设计

### 5.1 认证与授权

- 使用 NextAuth.js 或自定义 JWT 认证
- 密码使用 bcrypt 加密存储
- 管理员角色权限控制（RBAC）

### 5.2 数据验证

- 前端表单验证（Zod / Yup）
- 后端 API 输入验证
- SQL 注入防护（Prisma 参数化查询）

### 5.3 其他安全措施

- CSRF 防护
- XSS 防护
- 速率限制（Rate Limiting）
- 敏感操作日志记录

---

## 6. 性能优化

### 6.1 前端优化

- 静态生成（SSG）用于官网页面
- 服务端渲染（SSR）用于动态内容
- 图片懒加载
- 代码分割

### 6.2 后端优化

- 数据库查询优化（索引、分页）
- Redis 缓存热点数据
- API 响应压缩

### 6.3 数据库优化

- 合理设计索引
- 读写分离（可选）
- 定期清理日志表

---

## 7. 开发规范

### 7.1 代码规范

- TypeScript 严格模式
- ESLint + Prettier 代码格式化
- 组件化开发，单一职责

### 7.2 Git 工作流

```
main          # 主分支
├── develop   # 开发分支
├── feature/* # 功能分支
└── hotfix/*  # 热修复分支
```

### 7.3 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

---

## 8. 下一步工作

### Phase 2: 后端开发
- 实现 API 接口（CRUD）
- 处理动态 SKU 逻辑
- 实现图片上传功能

### Phase 3: 前端开发
- 官网展示页（响应式）
- 管理端 UI 组件

### Phase 4: 测试与验收
- 验证动态参数保存
- 验证 SKU 逻辑闭环
- 输出测试用例

---

## 附录

### A. 环境变量示例

```env
# 数据库
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# 认证
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# 对象存储
AWS_ACCESS_KEY_ID="xxx"
AWS_SECRET_ACCESS_KEY="xxx"
AWS_BUCKET_NAME="your-bucket"
AWS_REGION="us-east-1"

# Redis
REDIS_URL="redis://localhost:6379"
```

### B. Prisma 常用命令

```bash
# 生成 Prisma Client
npx prisma generate

# 创建迁移
npx prisma migrate dev --name init

# 部署迁移
npx prisma migrate deploy

# 打开 Prisma Studio
npx prisma studio

# 重置数据库
npx prisma migrate reset
```
