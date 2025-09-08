/*
  Warnings:

  - Added the required column `budgetName` to the `budget` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."budget" ADD COLUMN     "budgetName" VARCHAR(255) NOT NULL;
