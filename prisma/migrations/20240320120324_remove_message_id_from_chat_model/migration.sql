/*
  Warnings:

  - You are about to drop the column `messageId` on the `Chat` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Chat_messageId_key";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "messageId";
