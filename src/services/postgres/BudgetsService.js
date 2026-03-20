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
      const budgetRepo = new this._repositoryClass(tx);

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
      } else {
        period_end = payload.period_end;
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

  async updateBudgetById(userId, budgetId, payload) {
    const budget = await this._repository.verifyUserOwnBudget(userId, budgetId);

    if (!budget.id) {
      throw new NotFoundError("Budget tidak ditemukan");
    }

    const { budget_name, type, amount } = payload;

    if ((amount !== null) & (amount !== 0)) {
      await this._repository.updateBudgetLimit(budgetId, amount);
    }

    const result = await this._repository.updateBudget(budgetId, {
      budget_name,
      type,
    });

    if (!result.id) {
      throw new InvariantError("Terjadi kesalahan saat update Budget");
    }

    return result;
  }

  async deleteBudgetById(userId, budgetId) {
    const budget = await this._repository.verifyUserOwnBudget(userId, budgetId);

    if (!budget.id) {
      throw new NotFoundError("Budget tidak ditemukan atau sudah dihapus");
    }

    const result = await this._repository.deleteBudget(budgetId);

    return result;
  }

  // async handleMonthlyReset(){
  //   const now = new Date()

  //   const budgets = await this._repository.
  // }
}

module.exports = BudgetService;
