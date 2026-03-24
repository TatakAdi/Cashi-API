const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthenticationError = require("../../exceptions/AuthenticationError");

class DashboardService {
  constructor(categoryRepository, transactionRepository, budgetRepository) {
    this._categoryRepository = categoryRepository;
    this._transactionRepository = transactionRepository;
    this._budgetRepository = budgetRepository;
  }

  async getDashboardTransaction(userId) {
    const [all, income, expenses] = await Promise.all([
      this._transactionRepository.findTransactionsByUser(userId, { limit: 5 }),
      this._transactionRepository.findTransactionsByUser(userId, {
        limit: 5,
        type: "Income",
      }),
      this._transactionRepository.findTransactionsByUser(userId, {
        limit: 5,
        type: "Expenses",
      }),
    ]);

    return { all, income, expenses };
  }

  async getDashboardBudget(userId) {
    const data = await this._budgetRepository.findAllBudgetsByUser(userId);

    const prioritizedBudgets = data
      .map((b) => {
        const ratio =
          b.amount_limit > 0 ? b.current_amount / b.amount_limit : 0;

        return { ...b, usage_ratio: ratio };
      })
      .sort((a, b) => {
        if (a.usage_ratio > 1 && b.usage_ratio <= 1) return -1;
        if (b.usage_ratio > 1 && a.usage_ratio <= 1) return 1;

        return b.usage_ratio - a.usage_ratio;
      });

    return prioritizedBudgets.slice(0, 5);
  }
}

module.exports = DashboardService;
