const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthenticationError = require("../../exceptions/AuthenticationError");

class BudgetService {
  constructor(prisma, repository) {
    this._prisma = prisma;
    this._repository = repository;
  }

  async createBudget(userId, payload) {
    const {
      budget_name,
      type,
      amount_limit,
      period_start,
      category_ids = [],
    } = payload;
    return this._prisma.$transaction(async (tx) => {
      const budgetRepo = new this._repository(tx);

      let period_end = null;

      if (type === "Monthly") {
        const start = new Date(period_start);
        period_end = new Date(
          start.getFullYear(),
          start.getMonth() + 1,
          0,
          23,
          59,
          59,
        );
      }
      const { id: budgetId } = await budgetRepo.createBudget({
        user_id: userId,
        budget_name,
        type,
        amount_limit,
        current_amount: 0,
        period_start,
        period_end,
      });

      for (const categoryId of category_ids) {
        await budgetRepo.attachCategoryToBudget(budgetId, categoryId);
      }
      await budgetRepo.createBudgetUsage(budgetId, period_start, period_end);

      return { budget_id: budgetId };
    });
  }
}

module.exports = BudgetService;
