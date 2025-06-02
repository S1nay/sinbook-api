/*
  Warnings:

  - You are about to drop the column `views` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `birth_date` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `hobby` on the `User` table. All the data in the column will be lost.
  - Added the required column `biography` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "views";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "birth_date",
DROP COLUMN "gender",
DROP COLUMN "hobby",
ADD COLUMN     "biography" TEXT NOT NULL;

-- DropEnum
DROP TYPE "Gender";
