const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthenticationError = require("../../exceptions/AuthenticationError");

class TransactionService {
  constructor(userRepository, categoryRepository, transactionRepository) {
    this._userRepository = userRepository;
    this._categoryRepository = categoryRepository;
    this._transactionRepository = transactionRepository;
  }

  async createTransaction(userId, payload) {
    const {
      transaction_name,
      type,
      amount,
      transaction_date,
      note,
      categoryId,
    } = payload;

    const isGlobalCategory =
      await this._categoryRepository.verifyGlobalCategory(categoryId);

    if (!isGlobalCategory) {
      const isUserOwnCategory =
        await this._categoryRepository.verifyUserOwnCategory(
          userId,
          categoryId,
        );

      if (!isUserOwnCategory.id) {
        throw new InvariantError("User tidak memiliki kategori ini");
      }
    }

    const { id: transactionId } =
      await this._transactionRepository.createTransaction({
        user_id: userId,
        transaction_name,
        type,
        amount,
        transaction_date,
        note,
        category_id: categoryId,
      });

    if (type === "Expenses") {
      await this._userRepository.decreaseBalance(userId, amount);
    } else {
      await this._userRepository.increaseBalance(userId, amount);
    }

    return { transactionId };
  }

  async getAllTransactions(userId, query) {
    let { page, limit, type } = query;

    if (type) {
      const mapping = {
        income: "Income",
        expense: "Expenses",
        expenses: "Expenses",
      };

      type = mapping[type.toLowerCase()] || null;
    }

    const result = await this._transactionRepository.findTransactionsByUser(
      userId,
      {
        page: Number(page),
        limit: Number(limit),
        type,
      },
    );

    return result;
  }

  async getOneTransactionById(userId, transactionId) {
    const result = await this._transactionRepository.verifyUserOwnTransaction(
      userId,
      transactionId,
    );

    if (!result.id) {
      throw new NotFoundError("Transaksi tidak ditemukan");
    }

    const data =
      await this._transactionRepository.findTransationById(transactionId);

    return data;
  }

  async deleteOneTransactionById(userId, transactionId) {
    const transaction =
      await this._transactionRepository.verifyUserOwnTransaction(
        userId,
        transactionId,
      );
    if (!transaction.id) {
      throw new NotFoundError("Transaksi tidak ditemukan");
    }
    const data =
      await this._transactionRepository.findTransationById(transactionId);

    if (data.type === "Expenses") {
      await this._userRepository.increaseBalance(userId, data.amount);
    } else {
      await this._userRepository.decreaseBalance(userId, data.amount);
    }

    const result =
      await this._transactionRepository.deleteTransaction(transactionId);

    return result;
  }
}

module.exports = TransactionService;
