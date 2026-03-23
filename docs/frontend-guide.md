# 前端开发指南

**项目**: 卡车官网与管理系统  
**版本**: 1.0  
**创建时间**: 2026-03-20

---

## 项目结构

```
src/
├── app/
│   ├── (public)/           # C 端官网（公开页面）
│   │   ├── layout.tsx      # 官网布局（Header + Footer）
│   │   ├── page.tsx        # 首页
│   │   ├── products/
│   │   │   ├── page.tsx    # 产品列表
│   │   │   └── [slug]/
│   │   │       └── page.tsx # 产品详情
│   │   ├── about/
│   │   │   └── page.tsx    # 关于我们
│   │   ├── contact/
│   │   │   └── page.tsx    # 联系我们
│   │   └── articles/
│   │       ├── page.tsx    # 文章列表
│   │       └── [slug]/
│   │           └── page.tsx # 文章详情
│   ├── (admin)/            # B 端管理后台（需登录）
│   │   ├── layout.tsx      # 管理后台布局（Sidebar + Header）
│   │   ├── login/
│   │   │   └── page.tsx    # 登录页
│   │   ├── dashboard/
│   │   │   └── page.tsx    # 仪表盘
│   │   ├── products/
│   │   │   ├── page.tsx    # 产品列表
│   │   │   └── new/
│   │   │       └── page.tsx # 新建产品
│   │   ├── orders/
│   │   │   └── page.tsx    # 订单管理
│   │   ├── articles/
│   │   │   └── page.tsx    # 文章管理
│   │   ├── pages/
│   │   │   └── page.tsx    # 页面配置
│   │   └── settings/
│   │       └── page.tsx    # 系统设置
│   ├── api/                # API 路由（Phase 2 已实现）
│   ├── globals.css         # 全局样式
│   └── layout.tsx          # 根布局
├── components/
│   ├── ui/                 # 基础 UI 组件（Shadcn/ui）
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── public/             # C 端组件
│   │   ├── Header.tsx      # 官网头部
│   │   ├── Footer.tsx      # 官网底部
│   │   ├── ProductCard.tsx # 产品卡片
│   │   ├── ProductGallery.tsx # 产品图片画廊
│   │   ├── SkuSelector.tsx # SKU 选择器
│   │   └── InquiryForm.tsx # 询价表单
│   ├── admin/              # B 端组件
│   │   ├── Sidebar.tsx     # 侧边栏
│   │   ├── AdminHeader.tsx # 管理后台头部
│   │   ├── ProductForm.tsx # 产品表单
│   │   ├── ImageUploader.tsx # 图片上传
│   │   └── ...
│   └── forms/              # 表单组件
├── lib/
│   ├── api.ts              # API 客户端（SWR）
│   ├── types.ts            # TypeScript 类型定义
│   ├── utils.ts            # 工具函数
│   └── validations.ts      # Zod 验证 schema
└── hooks/                  # 自定义 Hooks
```

---

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **组件库**: Shadcn/ui (基于 Radix UI)
- **状态管理**: React Hooks + SWR
- **表单**: React Hook Form + Zod
- **图表**: (可选) Recharts / Chart.js

---

## 核心功能实现

### 1. 动态参数展示

产品详情页的参数表从 `Product.attributes` (JSONB) 动态渲染：

```tsx
// src/app/(public)/products/[slug]/page.tsx
{product.attributes && Object.keys(product.attributes).length > 0 && (
  <div className="divide-y">
    {Object.entries(product.attributes).map(([key, value]) => (
      <div key={key} className="grid grid-cols-2 py-3">
        <span className="text-muted-foreground">{getParameterLabel(key)}</span>
        <span className="font-medium">{formatParameterValue(key, value)}</span>
      </div>
    ))}
  </div>
)}
```

### 2. SKU 选择器

支持多维度选择，实时计算价格：

```tsx
// src/components/public/SkuSelector.tsx
export function SkuSelector({ skuOptions, skus, onSkuSelect }) {
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});

  // 根据选择匹配 SKU
  const selectedSku = useMemo(() => {
    const selectedValueIds = Object.values(selectedValues);
    return skus.find(sku => {
      const skuValueIds = sku.optionValues.map(ov => ov.optionValue.id);
      return selectedValueIds.every(id => skuValueIds.includes(id));
    });
  }, [selectedValues, skus]);

  // 渲染选项...
}
```

### 3. 图片上传

支持拖拽上传、多图预览：

```tsx
// src/components/admin/ImageUploader.tsx
const { getRootProps, getInputProps } = useDropzone({
  onDrop: async (files) => {
    const result = await uploadFiles(files);
    onChange(result.data.map(f => f.url));
  },
  accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
});
```

---

## API 调用示例

### 获取产品列表

```tsx
import { useProducts } from '@/lib/api';

function ProductList() {
  const { products, isLoading, meta } = useProducts({
    category: 'heavy-truck',
    pageSize: 12,
  });

  if (isLoading) return <div>加载中...</div>;

  return (
    <div className="grid grid-cols-3 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### 创建产品

```tsx
import { createProduct } from '@/lib/api';

async function handleCreate(data) {
  const result = await createProduct(data);
  if (result.success) {
    // 创建成功
  } else {
    // 处理错误
  }
}
```

---

## 组件使用指南

### Button

```tsx
import { Button } from '@/components/ui/button';

<Button>默认按钮</Button>
<Button variant="secondary">次要按钮</Button>
<Button variant="outline">边框按钮</Button>
<Button variant="ghost">幽灵按钮</Button>
<Button size="sm">小按钮</Button>
<Button size="lg">大按钮</Button>
<Button disabled>禁用按钮</Button>
```

### Input

```tsx
import { Input } from '@/components/ui/input';

<Input placeholder="请输入..." />
<Input type="email" placeholder="邮箱" />
<Input disabled />
```

### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>卡片标题</CardTitle>
  </CardHeader>
  <CardContent>
    卡片内容
  </CardContent>
</Card>
```

---

## 响应式设计

使用 Tailwind CSS 的 breakpoint 实现三端适配：

```tsx
// 移动端优先
<div className="
  grid grid-cols-1        /* 手机：1 列 */
  md:grid-cols-2          /* 平板：2 列 */
  lg:grid-cols-4          /* PC: 4 列 */
">
  {/* 内容 */}
</div>

// 隐藏/显示
<div className="hidden md:block">  {/* 平板和 PC 显示 */}
<div className="md:hidden">        {/* 仅手机显示 */}
```

---

## 部署教程

### 1. 环境准备

```bash
# 安装依赖
npm install

# 复制环境变量
cp .env.example .env.local

# 配置环境变量
NEXT_PUBLIC_API_URL=/api
DATABASE_URL="postgresql://..."
```

### 2. 数据库迁移

```bash
# 生成 Prisma 客户端
npm run db:generate

# 执行数据库迁移
npm run db:migrate

# 部署迁移（生产环境）
npm run db:deploy
```

### 3. 构建和启动

```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 启动生产服务器
npm start
```

### 4. Docker 部署（可选）

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
docker build -t truck-website .
docker run -p 3000:3000 --env-file .env.local truck-website
```

---

## 性能优化

### 1. 图片优化

- 使用 Next.js Image 组件自动优化
- 设置合适的 `sizes` 属性
- 首屏图片使用 `priority`

```tsx
<Image
  src={product.image}
  alt={product.name}
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
  priority
/>
```

### 2. 代码分割

Next.js App Router 自动按路由分割代码。

### 3. 数据缓存

使用 SWR 进行数据缓存和重新验证：

```tsx
const { data } = useSWR('/api/products', fetcher, {
  revalidateOnFocus: false,
  dedupingInterval: 2000,
});
```

---

## 常见问题

### Q: 如何处理动态参数的类型？

A: 使用 TypeScript 的索引签名：

```tsx
interface Product {
  attributes?: Record<string, any>;
}
```

### Q: SKU 选择器如何支持图片预览？

A: 在 `SkuOptionValue` 中添加 `image` 字段，选择时显示对应图片。

### Q: 如何实现权限控制？

A: 在管理后台 layout 中添加认证检查：

```tsx
// src/app/(admin)/layout.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }) {
  const session = await getServerSession();
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/admin/login');
  }
  return <>{children}</>;
}
```

---

## 下一步开发

1. **完善表单验证**: 添加更多 Zod schema
2. **优化移动端体验**: 测试并调整响应式布局
3. **添加错误边界**: 处理 API 错误和边界情况
4. **SEO 优化**: 添加 meta 标签和结构化数据
5. **性能监控**: 集成 Lighthouse CI

---

## 联系支持

如有问题，请联系前端开发团队。
