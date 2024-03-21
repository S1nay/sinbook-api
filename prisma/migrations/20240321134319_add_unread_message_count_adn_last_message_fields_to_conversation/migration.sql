/*
  Warnings:

  - A unique constraint covering the columns `[lastMessagId]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `lastMessagId` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unread_messages_count` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "lastMessagId" INTEGER NOT NULL,
ADD COLUMN     "unread_messages_count" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_lastMessagId_key" ON "Conversation"("lastMessagId");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_lastMessagId_fkey" FOREIGN KEY ("lastMessagId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
