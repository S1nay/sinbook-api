/*
  Warnings:

  - You are about to drop the column `last_message` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `unread_messages_count` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the `_ConversationToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_followers` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_userId_fkey";

-- DropForeignKey
ALTER TABLE "_ConversationToUser" DROP CONSTRAINT "_ConversationToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_ConversationToUser" DROP CONSTRAINT "_ConversationToUser_B_fkey";

-- DropForeignKey
ALTER TABLE "_followers" DROP CONSTRAINT "_followers_A_fkey";

-- DropForeignKey
ALTER TABLE "_followers" DROP CONSTRAINT "_followers_B_fkey";

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "last_message",
DROP COLUMN "unread_messages_count",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "conversationId" DROP NOT NULL;

-- DropTable
DROP TABLE "_ConversationToUser";

-- DropTable
DROP TABLE "_followers";

-- CreateTable
CREATE TABLE "Follows" (
    "followerId" INTEGER NOT NULL,
    "followingId" INTEGER NOT NULL,

    CONSTRAINT "Follows_pkey" PRIMARY KEY ("followerId","followingId")
);

-- CreateTable
CREATE TABLE "_user_conversations" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_user_conversations_AB_unique" ON "_user_conversations"("A", "B");

-- CreateIndex
CREATE INDEX "_user_conversations_B_index" ON "_user_conversations"("B");

-- AddForeignKey
ALTER TABLE "Follows" ADD CONSTRAINT "Follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follows" ADD CONSTRAINT "Follows_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_user_conversations" ADD CONSTRAINT "_user_conversations_A_fkey" FOREIGN KEY ("A") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_user_conversations" ADD CONSTRAINT "_user_conversations_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
