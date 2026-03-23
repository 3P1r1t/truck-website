-- Add product price range upper bound
ALTER TABLE "products" ADD COLUMN "maxPrice" DECIMAL(15,2);
UPDATE "products" SET "maxPrice" = "basePrice" WHERE "maxPrice" IS NULL;
ALTER TABLE "products" ALTER COLUMN "maxPrice" SET NOT NULL;
ALTER TABLE "products" ALTER COLUMN "maxPrice" SET DEFAULT 0;

-- Update inquiry status enum to new workflow
CREATE TYPE "InquiryStatus_new" AS ENUM ('PENDING', 'FOLLOWING', 'WAITING_REPLY', 'INTERESTED', 'CONVERTED', 'ABANDONED');
ALTER TABLE "inquiries" ADD COLUMN "status_new" "InquiryStatus_new";
UPDATE "inquiries"
SET "status_new" = CASE "status"
  WHEN 'NEW' THEN 'PENDING'
  WHEN 'IN_PROGRESS' THEN 'FOLLOWING'
  WHEN 'RESPONDED' THEN 'WAITING_REPLY'
  WHEN 'COMPLETED' THEN 'CONVERTED'
  WHEN 'CLOSED' THEN 'ABANDONED'
  ELSE 'PENDING'
END;
ALTER TABLE "inquiries" ALTER COLUMN "status_new" SET NOT NULL;
ALTER TABLE "inquiries" ALTER COLUMN "status_new" SET DEFAULT 'PENDING';
ALTER TABLE "inquiries" DROP COLUMN "status";
ALTER TABLE "inquiries" RENAME COLUMN "status_new" TO "status";
DROP TYPE "InquiryStatus";
ALTER TYPE "InquiryStatus_new" RENAME TO "InquiryStatus";

-- Add inquiry tag and follow-up fields
CREATE TYPE "InquiryTag" AS ENUM ('HIGH', 'MEDIUM', 'LOW');
ALTER TABLE "inquiries" ADD COLUMN "tag" "InquiryTag" NOT NULL DEFAULT 'MEDIUM';
UPDATE "inquiries"
SET "tag" = CASE "intentLevel"
  WHEN 'HIGH' THEN 'HIGH'
  WHEN 'MEDIUM' THEN 'MEDIUM'
  ELSE 'LOW'
END;

ALTER TABLE "inquiries" ADD COLUMN "nextFollowUpAt" TIMESTAMP(3);
ALTER TABLE "inquiries" ADD COLUMN "followUpLogs" JSONB;
ALTER TABLE "inquiries" ADD COLUMN "abandonReason" TEXT;

-- Clean up deprecated intent fields
ALTER TABLE "inquiries" DROP COLUMN "intentLevel";
ALTER TABLE "inquiries" DROP COLUMN "intentUpdatedAt";
