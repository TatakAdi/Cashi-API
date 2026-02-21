const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthenticationError = require("../../exceptions/AuthenticationError");

class BudgetService {
  constructor(prisma, classRepository, repository) {
    this._prisma = prisma;
    this._repositoryClass = classRepository; // Untuk request yang memiliki Transaksi
    this._repository = repository; // Buat Read
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

  async getAllBudgetPerUser(userId) {
    const result = await this._repository.findAllBudgetsByUser(userId);

    return result;
  }

  async getOneBudgetByIdPerUser(userId, budgetId) {
    const result = await this._repository.verifyUserOwnBudget(userId, budgetId);

    if (!result.id) {
      throw new NotFoundError("Budget tidak ditemukan");
    }

    const data = await this._repository.findBudgetById(budgetId);

    return data;
  }
}

module.exports = BudgetService;
