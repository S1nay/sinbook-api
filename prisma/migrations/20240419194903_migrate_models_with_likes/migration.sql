/*
  Warnings:

  - You are about to drop the column `creatorId` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `recipientId` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `birthDate` on the `User` table. All the data in the column will be lost.
  - Added the required column `creator_id` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipient_id` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_recipientId_fkey";

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "creatorId",
DROP COLUMN "recipientId",
ADD COLUMN     "creator_id" INTEGER NOT NULL,
ADD COLUMN     "recipient_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "birthDate",
ADD COLUMN     "birth_date" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
