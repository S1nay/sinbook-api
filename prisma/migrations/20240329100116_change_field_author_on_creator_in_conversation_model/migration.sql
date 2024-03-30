/*
  Warnings:

  - You are about to drop the column `author_id` on the `Conversation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[creator_id]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `creator_id` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_author_id_fkey";

-- DropIndex
DROP INDEX "Conversation_author_id_key";

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "author_id",
ADD COLUMN     "creator_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_creator_id_key" ON "Conversation"("creator_id");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
