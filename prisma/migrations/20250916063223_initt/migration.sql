/*
  Warnings:

  - You are about to drop the column `approvedby` on the `Complaint` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Complaint" DROP COLUMN "approvedby",
ADD COLUMN     "complaintby" TEXT;

-- AlterTable
ALTER TABLE "public"."Hostel" ADD COLUMN     "approvedby" TEXT;
