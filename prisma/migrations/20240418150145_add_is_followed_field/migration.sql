/*
  Warnings:

  - Added the required column `isFollowed` to the `Follows` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Follows" ADD COLUMN     "isFollowed" BOOLEAN NOT NULL;
