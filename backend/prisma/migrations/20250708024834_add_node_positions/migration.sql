/*
  Warnings:

  - You are about to drop the `Layout` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Layout" DROP CONSTRAINT "Layout_userId_fkey";

-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "positionX" DOUBLE PRECISION,
ADD COLUMN     "positionY" DOUBLE PRECISION;

-- DropTable
DROP TABLE "Layout";
