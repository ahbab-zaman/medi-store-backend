-- DropIndex
DROP INDEX "chunks_embedding_idx";

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "imagePublicId" TEXT;

-- AlterTable
ALTER TABLE "chat_sessions" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "documents" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "medicines" ADD COLUMN     "imagePublicId" TEXT;
