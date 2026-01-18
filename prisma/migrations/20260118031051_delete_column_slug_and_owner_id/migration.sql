/*
  Warnings:

  - You are about to drop the column `owner_id` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `categories` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "categories_slug_type_owner_id_key";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "owner_id",
DROP COLUMN "slug";
