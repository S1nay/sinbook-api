-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_last_message_id_fkey";

-- AlterTable
ALTER TABLE "Conversation" ALTER COLUMN "last_message_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_last_message_id_fkey" FOREIGN KEY ("last_message_id") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
