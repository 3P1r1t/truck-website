# 后端 API 接口文档

**项目**: 官网与管理系统  
**版本**: 1.0  
**创建时间**: 2026-03-20  
**技术栈**: Next.js 14 + TypeScript + Prisma + PostgreSQL

---

## 基础说明

### 响应格式

所有 API 接口统一返回格式：

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}
```

错误响应：

```json
{
  "success": false,
  "error": "错误信息"
}
```

### 认证说明

- 使用 NextAuth.js 进行 JWT 认证
- 需要认证的接口会在文档中标注 **（需登录）** 或 **（管理员）**
- 请求头携带：`Authorization: Bearer <token>`

### 分页参数

列表接口支持分页：

- `page`: 页码（默认 1）
- `pageSize`: 每页数量（默认 20，最大 100）

---

## 认证模块 `/api/auth`

### 1. 用户登录

```
POST /api/auth/signin
```

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "xxx",
      "email": "user@example.com",
      "name": "张三",
      "role": "USER"
    }
  }
}
```

---

### 2. 用户注册

```
POST /api/auth/register
```

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "张三"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "message": "注册成功",
    "user": {
      "id": "xxx",
      "email": "user@example.com",
      "name": "张三",
      "role": "USER"
    }
  }
}
```

---

### 3. 用户登出

```
POST /api/auth/signout
```

---

## 产品模块 `/api/products`

### 1. 获取产品列表

```
GET /api/products
```

**查询参数**:
- `page`: 页码
- `pageSize`: 每页数量
- `category`: 分类 ID
- `search`: 搜索关键词
- `featured`: 是否只获取推荐商品

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "xxx",
      "name": "卡车 A",
      "slug": "truck-a",
      "basePrice": "100000.00",
      "salePrice": "95000.00",
      "isOnSale": true,
      "category": {
        "id": "xxx",
        "name": "重卡",
        "slug": "heavy-truck"
      },
      "images": [
        {
          "id": "xxx",
          "url": "/uploads/xxx.jpg",
          "alt": "卡车 A 主图"
        }
      ],
      "skus": [
        {
          "id": "xxx",
          "sku": "SKU-XXX-RED-XL",
          "price": "100000.00",
          "stock": 50
        }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}
```

---

### 2. 获取产品详情

```
GET /api/products/[slug]
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "xxx",
    "name": "卡车 A",
    "slug": "truck-a",
    "description": "详细描述...",
    "shortDesc": "简短描述",
    "basePrice": "100000.00",
    "salePrice": "95000.00",
    "isOnSale": true,
    "category": {
      "id": "xxx",
      "name": "重卡",
      "slug": "heavy-truck",
      "parent": {
        "id": "xxx",
        "name": "卡车",
        "slug": "truck"
      }
    },
    "images": [
      {
        "id": "xxx",
        "url": "/uploads/xxx.jpg",
        "alt": "图片 1",
        "sortOrder": 0,
        "isPrimary": true
      }
    ],
    "skuOptions": [
      {
        "id": "xxx",
        "name": "颜色",
        "sortOrder": 0,
        "values": [
          {
            "id": "xxx",
            "value": "红色",
            "image": "/uploads/red.jpg"
          }
        ]
      }
    ],
    "skus": [
      {
        "id": "xxx",
        "sku": "SKU-XXX-RED-XL",
        "price": "100000.00",
        "stock": 50,
        "isActive": true,
        "optionValues": [
          {
            "id": "xxx",
            "optionValue": {
              "id": "xxx",
              "value": "红色",
              "option": {
                "id": "xxx",
                "name": "颜色"
              }
            }
          }
        ]
      }
    ],
    "reviews": [
      {
        "id": "xxx",
        "rating": 5,
        "title": "很好",
        "content": "内容...",
        "user": {
          "id": "xxx",
          "name": "张三",
          "avatar": "/uploads/avatar.jpg"
        },
        "createdAt": "2026-03-20T10:00:00Z"
      }
    ],
    "viewCount": 1000,
    "isActive": true,
    "isFeatured": true,
    "createdAt": "2026-03-20T10:00:00Z",
    "updatedAt": "2026-03-20T10:00:00Z"
  }
}
```

---

### 3. 创建产品 **（管理员）**

```
POST /api/products
```

**请求体**:
```json
{
  "name": "卡车 A",
  "slug": "truck-a",
  "description": "详细描述...",
  "shortDesc": "简短描述",
  "categoryId": "xxx",
  "basePrice": 100000,
  "salePrice": 95000,
  "isOnSale": true,
  "metaTitle": "卡车 A - 高性能重卡",
  "metaDesc": "卡车 A 的 SEO 描述",
  "keywords": "卡车，重卡，运输",
  "isActive": true,
  "isFeatured": true
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "xxx",
    "name": "卡车 A",
    "slug": "truck-a",
    ...
  }
}
```

---

### 4. 更新产品 **（管理员）**

```
PUT /api/products/[slug]
```

**请求体**: （同创建产品，所有字段可选）

---

### 5. 删除产品 **（管理员）**

```
DELETE /api/products/[slug]
```

**响应**:
```json
{
  "success": true,
  "data": {
    "message": "产品已删除"
  }
}
```

---

## SKU 模块 `/api/products/[productId]/skus`

### 1. 获取产品 SKU 配置

```
GET /api/products/[productId]/skus
```

**响应**:
```json
{
  "success": true,
  "data": {
    "productId": "xxx",
    "options": [
      {
        "id": "xxx",
        "name": "颜色",
        "sortOrder": 0,
        "values": [
          {
            "id": "xxx",
            "value": "红色",
            "image": "/uploads/red.jpg",
            "skuVariants": [
              {
                "id": "xxx",
                "sku": "SKU-XXX-RED",
                "price": "100000.00",
                "stock": 50,
                "isActive": true
              }
            ]
          }
        ]
      }
    ]
  }
}
```

---

### 2. 添加 SKU 选项 **（管理员）**

```
POST /api/products/[productId]/skus
```

**请求体**:
```json
{
  "action": "addOption",
  "name": "颜色",
  "sortOrder": 0
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "xxx",
    "name": "颜色",
    "productId": "xxx",
    "sortOrder": 0,
    "values": []
  }
}
```

---

### 3. 添加 SKU 选项值 **（管理员）**

```
POST /api/products/[productId]/skus
```

**请求体**:
```json
{
  "action": "addOptionValue",
  "optionId": "xxx",
  "value": "红色",
  "image": "/uploads/red.jpg"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "xxx",
    "value": "红色",
    "optionId": "xxx",
    "image": "/uploads/red.jpg",
    "option": {
      "id": "xxx",
      "name": "颜色"
    }
  }
}
```

---

### 4. 生成 SKU 变体 **（管理员）**

```
POST /api/products/[productId]/skus
```

**请求体**:
```json
{
  "action": "generateVariants",
  "options": [
    {
      "optionId": "xxx",
      "valueIds": ["xxx", "yyy"]
    },
    {
      "optionId": "zzz",
      "valueIds": ["aaa", "bbb"]
    }
  ],
  "basePrice": 100000,
  "stock": 50
}
```

**说明**: 自动生成所有组合（笛卡尔积），如：
- 红色-XL
- 红色-L
- 蓝色-XL
- 蓝色-L

**响应**:
```json
{
  "success": true,
  "data": {
    "message": "成功生成 4 个 SKU 变体",
    "variants": [
      {
        "id": "xxx",
        "sku": "SKU-XXX-RED-XL",
        "price": "100000.00",
        "stock": 50,
        "isActive": true
      }
    ]
  }
}
```

---

### 5. 获取 SKU 变体详情

```
GET /api/products/[productId]/skus/[skuId]
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "xxx",
    "sku": "SKU-XXX-RED-XL",
    "price": "100000.00",
    "stock": 50,
    "isActive": true,
    "optionValues": [
      {
        "id": "xxx",
        "optionValue": {
          "id": "xxx",
          "value": "红色",
          "option": {
            "id": "xxx",
            "name": "颜色"
          }
        }
      }
    ]
  }
}
```

---

### 6. 更新 SKU 变体 **（管理员）**

```
PUT /api/products/[productId]/skus/[skuId]
```

**请求体**:
```json
{
  "price": 105000,
  "stock": 30,
  "lowStockThreshold": 5,
  "isActive": true
}
```

---

### 7. 删除 SKU 变体 **（管理员）**

```
DELETE /api/products/[productId]/skus/[skuId]
```

---

## 产品图片模块 `/api/products/[productId]/images`

### 1. 获取产品图片列表

```
GET /api/products/[productId]/images
```

---

### 2. 添加产品图片 **（管理员）**

```
POST /api/products/[productId]/images
```

**请求体** (单个):
```json
{
  "url": "/uploads/xxx.jpg",
  "alt": "图片描述",
  "sortOrder": 0,
  "isPrimary": true
}
```

**请求体** (批量):
```json
[
  {
    "url": "/uploads/xxx.jpg",
    "alt": "图片 1",
    "sortOrder": 0,
    "isPrimary": true
  },
  {
    "url": "/uploads/yyy.jpg",
    "alt": "图片 2",
    "sortOrder": 1,
    "isPrimary": false
  }
]
```

---

### 3. 更新图片排序 **（管理员）**

```
PUT /api/products/[productId]/images
```

**请求体**:
```json
{
  "imageIds": ["xxx", "yyy", "zzz"]
}
```

---

### 4. 删除产品图片 **（管理员）**

```
DELETE /api/products/[productId]/images?imageId=xxx
```

---

## 分类模块 `/api/categories`

### 1. 获取分类列表

```
GET /api/categories
```

**查询参数**:
- `parentId`: 父分类 ID（`null` 表示只获取顶级分类）

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "xxx",
      "name": "重卡",
      "slug": "heavy-truck",
      "description": "重卡分类",
      "parentId": null,
      "sortOrder": 0,
      "isActive": true,
      "parent": null,
      "_count": {
        "products": 10
      }
    }
  ]
}
```

---

### 2. 创建分类 **（管理员）**

```
POST /api/categories
```

**请求体**:
```json
{
  "name": "重卡",
  "slug": "heavy-truck",
  "description": "重卡分类",
  "parentId": null,
  "sortOrder": 0,
  "isActive": true
}
```

---

### 3. 获取分类详情

```
GET /api/categories/[id]
```

---

### 4. 更新分类 **（管理员）**

```
PUT /api/categories/[id]
```

---

### 5. 删除分类 **（管理员）**

```
DELETE /api/categories/[id]
```

---

## 订单模块 `/api/orders`

### 1. 获取订单列表 **（需登录）**

```
GET /api/orders
```

**查询参数**:
- `page`: 页码
- `pageSize`: 每页数量
- `status`: 订单状态
- `userId`: 用户 ID（管理员可用）

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "xxx",
      "orderNo": "ORD-ABC123-XYZ",
      "userId": "xxx",
      "user": {
        "id": "xxx",
        "email": "user@example.com",
        "name": "张三"
      },
      "subtotal": "100000.00",
      "shippingFee": "0.00",
      "tax": "0.00",
      "discount": "0.00",
      "total": "100000.00",
      "status": "PENDING",
      "paymentStatus": "UNPAID",
      "shippingName": "张三",
      "shippingPhone": "13800138000",
      "shippingAddress": "北京市朝阳区 xxx",
      "items": [
        {
          "id": "xxx",
          "skuId": "xxx",
          "productName": "卡车 A",
          "skuName": "颜色：红色，尺寸：XL",
          "price": "100000.00",
          "quantity": 1,
          "sku": {
            "id": "xxx",
            "sku": "SKU-XXX-RED-XL",
            "optionValues": [
              {
                "optionValue": {
                  "value": "红色",
                  "option": {
                    "name": "颜色"
                  }
                }
              }
            ]
          }
        }
      ],
      "createdAt": "2026-03-20T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}
```

---

### 2. 创建订单 **（需登录）**

```
POST /api/orders
```

**请求体**:
```json
{
  "items": [
    {
      "skuId": "xxx",
      "quantity": 1
    }
  ],
  "shippingName": "张三",
  "shippingPhone": "13800138000",
  "shippingAddress": "北京市朝阳区 xxx",
  "shippingCity": "北京",
  "shippingState": "北京",
  "shippingZip": "100000",
  "shippingCountry": "CN",
  "customerNote": "请尽快发货"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "xxx",
    "orderNo": "ORD-ABC123-XYZ",
    "total": "100000.00",
    "status": "PENDING",
    ...
  }
}
```

---

### 3. 获取订单详情 **（需登录）**

```
GET /api/orders/[orderId]
```

---

### 4. 更新订单状态 **（管理员）**

```
PUT /api/orders/[orderId]
```

**请求体**:
```json
{
  "status": "CONFIRMED",
  "adminNote": "已确认，准备发货"
}
```

**状态枚举**: `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED`

---

### 5. 取消订单 **（需登录）**

```
DELETE /api/orders/[orderId]
```

---

## 文章模块 `/api/articles`

### 1. 获取文章列表

```
GET /api/articles
```

**查询参数**:
- `page`: 页码
- `pageSize`: 每页数量
- `search`: 搜索关键词

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "xxx",
      "title": "卡车保养指南",
      "slug": "truck-maintenance-guide",
      "excerpt": "卡车保养的重要性...",
      "coverImage": "/uploads/cover.jpg",
      "viewCount": 1000,
      "publishedAt": "2026-03-20T10:00:00Z",
      "createdAt": "2026-03-20T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}
```

---

### 2. 获取文章详情

```
GET /api/articles/[slug]
```

---

### 3. 创建文章 **（管理员）**

```
POST /api/articles
```

**请求体**:
```json
{
  "title": "卡车保养指南",
  "slug": "truck-maintenance-guide",
  "content": "详细内容...",
  "excerpt": "摘要...",
  "coverImage": "/uploads/cover.jpg",
  "categoryId": "xxx",
  "isActive": true,
  "publishedAt": "2026-03-20T10:00:00Z"
}
```

---

### 4. 更新文章 **（管理员）**

```
PUT /api/articles/[slug]
```

---

### 5. 删除文章 **（管理员）**

```
DELETE /api/articles/[slug]
```

---

## 系统设置模块 `/api/settings`

### 1. 获取系统设置

```
GET /api/settings
```

**查询参数**:
- `group`: 设置分组

**响应**:
```json
{
  "success": true,
  "data": {
    "byKey": {
      "siteName": "卡车官网",
      "siteDescription": "专业的卡车销售平台",
      "contactEmail": "info@example.com",
      "contactPhone": "400-123-4567"
    },
    "list": [
      {
        "id": "xxx",
        "key": "siteName",
        "value": "卡车官网",
        "type": "text",
        "group": "site",
        "label": "网站名称"
      }
    ]
  }
}
```

---

### 2. 创建/更新设置 **（管理员）**

```
POST /api/settings
```

**请求体** (单个):
```json
{
  "key": "siteName",
  "value": "卡车官网",
  "type": "text",
  "group": "site",
  "label": "网站名称"
}
```

**请求体** (批量):
```json
[
  {
    "key": "siteName",
    "value": "卡车官网",
    "type": "text",
    "group": "site",
    "label": "网站名称"
  },
  {
    "key": "contactEmail",
    "value": "info@example.com",
    "type": "text",
    "group": "contact",
    "label": "联系邮箱"
  }
]
```

---

## 文件上传模块 `/api/upload`

### 1. 单文件上传 **（管理员）**

```
POST /api/upload
```

**请求体**: `multipart/form-data`

- `file`: 文件

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "xxx",
    "url": "/uploads/xxx.jpg",
    "thumbnailUrl": "/uploads/xxx-thumb.jpg",
    "filename": "image.jpg",
    "mimeType": "image/jpeg",
    "size": 102400,
    "width": 1920,
    "height": 1080
  }
}
```

---

### 2. 多文件上传 **（管理员）**

```
PUT /api/upload
```

**请求体**: `multipart/form-data`

- `files[]`: 文件数组

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "xxx",
      "url": "/uploads/xxx.jpg",
      "thumbnailUrl": "/uploads/xxx-thumb.jpg",
      "filename": "image1.jpg",
      "mimeType": "image/jpeg",
      "size": 102400,
      "width": 1920,
      "height": 1080
    }
  ]
}
```

---

## 错误码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未登录 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

## 附录

### 订单状态流转

```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
    ↓
CANCELLED / REFUNDED
```

### SKU 变体生成逻辑

1. 管理员添加 SKU 选项（如：颜色、尺寸）
2. 为每个选项添加选项值（如：红色、蓝色；XL、L）
3. 调用 `generateVariants` 接口，传入选项和值 ID
4. 系统自动生成笛卡尔积组合
5. 每个变体可单独设置价格和库存

### 图片上传说明

- 支持格式：JPEG, PNG, GIF, WebP, MP4, WebM
- 最大文件大小：10MB（可配置）
- 自动生成缩略图（400x400）
- 返回 CDN URL（本地存储为 `/uploads/` 路径）
