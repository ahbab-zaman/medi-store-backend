-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "paymentMethod" TEXT NOT NULL DEFAULT 'COD',
ADD COLUMN     "transactionId" TEXT;
