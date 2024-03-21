/*
  Warnings:

  - You are about to drop the column `userId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the `_user_conversations` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `senderId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_userId_fkey";

-- DropForeignKey
ALTER TABLE "_user_conversations" DROP CONSTRAINT "_user_conversations_A_fkey";

-- DropForeignKey
ALTER TABLE "_user_conversations" DROP CONSTRAINT "_user_conversations_B_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "userId",
ADD COLUMN     "senderId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_user_conversations";

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

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
