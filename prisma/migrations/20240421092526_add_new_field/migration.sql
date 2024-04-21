/*
  Warnings:

  - Added the required column `triggered_id` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "triggered_id" INTEGER NOT NULL;
