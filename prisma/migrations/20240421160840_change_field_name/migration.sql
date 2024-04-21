/*
  Warnings:

  - You are about to drop the column `triggered_id` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `type_entity_id` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "triggered_id",
ADD COLUMN     "type_entity_id" INTEGER NOT NULL;
