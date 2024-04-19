/*
  Warnings:

  - The primary key for the `Follows` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `followerId` on the `Follows` table. All the data in the column will be lost.
  - You are about to drop the column `followingId` on the `Follows` table. All the data in the column will be lost.
  - You are about to drop the column `isFollowing` on the `Follows` table. All the data in the column will be lost.
  - Added the required column `follower_id` to the `Follows` table without a default value. This is not possible if the table is not empty.
  - Added the required column `following_id` to the `Follows` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mutual_follow` to the `Follows` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Follows" DROP CONSTRAINT "Follows_followerId_fkey";

-- DropForeignKey
ALTER TABLE "Follows" DROP CONSTRAINT "Follows_followingId_fkey";

-- AlterTable
ALTER TABLE "Follows" DROP CONSTRAINT "Follows_pkey",
DROP COLUMN "followerId",
DROP COLUMN "followingId",
DROP COLUMN "isFollowing",
ADD COLUMN     "follower_id" INTEGER NOT NULL,
ADD COLUMN     "following_id" INTEGER NOT NULL,
ADD COLUMN     "mutual_follow" BOOLEAN NOT NULL,
ADD CONSTRAINT "Follows_pkey" PRIMARY KEY ("follower_id", "following_id");

-- AddForeignKey
ALTER TABLE "Follows" ADD CONSTRAINT "Follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follows" ADD CONSTRAINT "Follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
