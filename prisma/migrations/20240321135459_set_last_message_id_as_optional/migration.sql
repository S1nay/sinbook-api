-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_lastMessagId_fkey";

-- AlterTable
ALTER TABLE "Conversation" ALTER COLUMN "lastMessagId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_lastMessagId_fkey" FOREIGN KEY ("lastMessagId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
