/*
  Warnings:

  - You are about to drop the column `title` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the `_friends` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `content` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_friends" DROP CONSTRAINT "_friends_A_fkey";

-- DropForeignKey
ALTER TABLE "_friends" DROP CONSTRAINT "_friends_B_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "title",
ADD COLUMN     "content" TEXT NOT NULL;

-- DropTable
DROP TABLE "_friends";
