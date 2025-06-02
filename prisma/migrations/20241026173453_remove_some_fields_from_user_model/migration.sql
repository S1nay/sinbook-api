/*
  Warnings:

  - You are about to drop the column `city` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `middle_name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `second_name` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "city",
DROP COLUMN "middle_name",
DROP COLUMN "second_name";
