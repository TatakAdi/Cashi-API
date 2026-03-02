const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthenticationError = require("../../exceptions/AuthenticationError");

class TransactionService {
  constructor(categoryRepository, transactionRepository) {
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

    return { transactionId };
  }

  async getAllTransactions(userId) {
    const result =
      await this._transactionRepository.findAllTransactionsByUser(userId);

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
}

module.exports = TransactionService;
