/*
  Warnings:

  - You are about to drop the `ConversationMembers` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `creatorId` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipientId` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ConversationMembers" DROP CONSTRAINT "ConversationMembers_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "ConversationMembers" DROP CONSTRAINT "ConversationMembers_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "ConversationMembers" DROP CONSTRAINT "ConversationMembers_recipientId_fkey";

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "creatorId" INTEGER NOT NULL,
ADD COLUMN     "recipientId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "ConversationMembers";

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
