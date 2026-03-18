const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthenticationError = require("../../exceptions/AuthenticationError");

class DashboardService {
  constructor(categoryRepository, transactionRepository) {
    this._categoryRepository = categoryRepository;
    this._transactionRepository = transactionRepository;
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
}

module.exports = DashboardService;
