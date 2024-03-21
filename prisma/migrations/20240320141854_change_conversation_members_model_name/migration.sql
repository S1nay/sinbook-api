/*
  Warnings:

  - You are about to drop the `ChatMembers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChatMembers" DROP CONSTRAINT "ChatMembers_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "ChatMembers" DROP CONSTRAINT "ChatMembers_memberId_fkey";

-- DropTable
DROP TABLE "ChatMembers";

-- CreateTable
CREATE TABLE "ConversationMembers" (
    "memberId" INTEGER NOT NULL,
    "conversationId" INTEGER NOT NULL,

    CONSTRAINT "ConversationMembers_pkey" PRIMARY KEY ("conversationId","memberId")
);

-- AddForeignKey
ALTER TABLE "ConversationMembers" ADD CONSTRAINT "ConversationMembers_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationMembers" ADD CONSTRAINT "ConversationMembers_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
