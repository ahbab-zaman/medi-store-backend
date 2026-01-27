-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "medicines" ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isBanned" BOOLEAN NOT NULL DEFAULT false;
