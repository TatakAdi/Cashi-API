const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthenticationError = require("../../exceptions/AuthenticationError");

class TransactionService {
  constructor(
    userRepository,
    categoryRepository,
    budgetRepository,
    transactionRepository,
  ) {
    this._userRepository = userRepository;
    this._categoryRepository = categoryRepository;
    this._budgetRepository = budgetRepository;
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
      budgetId,
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

    if (budgetId) {
      const isUserOwnBudget = await this._budgetRepository.verifyUserOwnBudget(
        userId,
        budgetId,
      );

      if (!isUserOwnBudget.id) {
        throw new InvariantError("User tidak memiliki budget ini");
      }

      await this._budgetRepository.increaseCurrentAmountBudget(
        budgetId,
        amount,
      );

      const usageId = await this._budgetRepository.findUsageByBudgetPeriod(
        budgetId,
        transaction_date,
      );
      if (usageId) {
        await this._budgetRepository.increaseUsedAmount(usageId.id, amount);
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
        budget_id: budgetId,
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

  async updateOneTransactionById(userId, transactionId, payload) {
    // Arrow Function getEffect
    const getEffect = (type, amount) => {
      return type === "Income" ? amount : -amount;
    };

    const getBudgetEffect = (type, amount) => {
      return type === "Expenses" ? amount : 0;
    };

    const transaction =
      await this._transactionRepository.verifyUserOwnTransaction(
        userId,
        transactionId,
      );

    if (!transaction.id) {
      throw new NotFoundError("Transaksi tidak ditemukan!");
    }

    const oldData =
      await this._transactionRepository.findTransationById(transactionId);

    const newData = {
      transaction_name: payload.transaction_name ?? oldData.transaction_name,
      type: payload.type ?? oldData.type,
      amount: payload.amount ?? oldData.amount,
      transaction_date: payload.transaction_date ?? oldData.transaction_date,
      note: payload.note ?? oldData.note,
      category_id: payload.categoryId ?? oldData.category.id,
      budget_id: payload.budgetId ?? oldData.budget?.id ?? null,
      updated_at: new Date(),
    };

    // Validasi Kategori Transaksi
    if (oldData.category.id !== newData.category_id) {
      const isGlobalCategory =
        await this._categoryRepository.verifyGlobalCategory(
          newData.category_id,
        );

      if (!isGlobalCategory) {
        const isUserOwnCategory =
          await this._categoryRepository.verifyUserOwnCategory(
            userId,
            newData.category_id,
          );

        if (!isUserOwnCategory.id) {
          throw new InvariantError("User tidak memiliki kategori ini");
        }
      }
    }

    // Validasi Budget
    if (newData.type === "Income") {
      newData.budget_id = null;
    }

    const oldBudgetId = oldData.budget?.id ?? null;
    const newBudgetId = newData.budget_id ?? null;

    if (
      oldBudgetId !== newBudgetId &&
      newData.type === "Expenses" &&
      newBudgetId
    ) {
      const isUserOwnBudget = await this._budgetRepository.verifyUserOwnBudget(
        userId,
        newBudgetId,
      );

      if (!isUserOwnBudget?.id) {
        throw new InvariantError("Budget tidak Ditemukan!");
      }
    }

    // Hitung Delta Balance
    const oldEffect = getEffect(oldData.type, oldData.amount);
    const newEffect = getEffect(newData.type, newData.amount);
    const deltaBalance = newEffect - oldEffect;

    if (deltaBalance !== 0) {
      if (deltaBalance >= 0) {
        await this._userRepository.increaseBalance(userId, deltaBalance);
      } else {
        await this._userRepository.decreaseBalance(
          userId,
          Math.abs(deltaBalance),
        );
      }
    }

    // Delta Budget
    await this._budgetRepository.applyTransactionImpact({ oldData, newData });

    const result = await this._transactionRepository.updateTransaction(
      transactionId,
      newData,
    );

    return result;
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
