-- Query performance indexes for product, inquiry and taxonomy listing endpoints
CREATE INDEX "brands_isActive_sortOrder_createdAt_idx" ON "brands"("isActive", "sortOrder", "createdAt");
CREATE INDEX "categories_isActive_parentId_sortOrder_createdAt_idx" ON "categories"("isActive", "parentId", "sortOrder", "createdAt");

CREATE INDEX "products_isActive_sortOrder_createdAt_idx" ON "products"("isActive", "sortOrder", "createdAt");
CREATE INDEX "products_brandId_isActive_idx" ON "products"("brandId", "isActive");
CREATE INDEX "products_categoryId_isActive_idx" ON "products"("categoryId", "isActive");
CREATE INDEX "products_fuelType_isActive_idx" ON "products"("fuelType", "isActive");
CREATE INDEX "products_isFeatured_isActive_sortOrder_idx" ON "products"("isFeatured", "isActive", "sortOrder");

CREATE INDEX "product_images_productId_isPrimary_sortOrder_createdAt_idx" ON "product_images"("productId", "isPrimary", "sortOrder", "createdAt");

CREATE INDEX "inquiries_status_createdAt_idx" ON "inquiries"("status", "createdAt");
CREATE INDEX "inquiries_tag_createdAt_idx" ON "inquiries"("tag", "createdAt");
CREATE INDEX "inquiries_productId_createdAt_idx" ON "inquiries"("productId", "createdAt");
CREATE INDEX "inquiries_createdAt_idx" ON "inquiries"("createdAt");
