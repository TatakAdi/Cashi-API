/*
  Warnings:

  - Added the required column `current_amount` to the `budget` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."budget" ADD COLUMN     "current_amount" DOUBLE PRECISION NOT NULL;
