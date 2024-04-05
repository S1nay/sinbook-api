/*
  Warnings:

  - You are about to drop the column `creator_id` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `recipient_id` on the `Conversation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_creator_id_fkey";

-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_recipient_id_fkey";

-- DropIndex
DROP INDEX "Conversation_creator_id_key";

-- DropIndex
DROP INDEX "Conversation_recipient_id_key";

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "creator_id",
DROP COLUMN "recipient_id";

-- CreateTable
CREATE TABLE "ConversationMembers" (
    "conversationId" INTEGER NOT NULL,
    "recipientId" INTEGER NOT NULL,
    "creatorId" INTEGER NOT NULL,

    CONSTRAINT "ConversationMembers_pkey" PRIMARY KEY ("recipientId","creatorId")
);

-- AddForeignKey
ALTER TABLE "ConversationMembers" ADD CONSTRAINT "ConversationMembers_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationMembers" ADD CONSTRAINT "ConversationMembers_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationMembers" ADD CONSTRAINT "ConversationMembers_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
