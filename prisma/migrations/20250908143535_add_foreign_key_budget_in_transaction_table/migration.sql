-- AlterTable
ALTER TABLE "public"."transaction" ADD COLUMN     "budget_id" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."transaction" ADD CONSTRAINT "transaction_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "public"."budget"("id") ON DELETE SET NULL ON UPDATE CASCADE;
