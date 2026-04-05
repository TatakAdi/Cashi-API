const { nanoid } = require("nanoid");

class BudgetRepository {
  constructor(prisma) {
    this._prisma = prisma;
  }

  // Budget Table

  // Create Budget
  //   🧱 A. BUDGET (tabel budgets)
  // Peran: rule / konfigurasi

  // Create
  // createBudget(userId, data)

  // Read
  // findBudgetById(budgetId)
  // findAllBudgetsByUser(userId)
  // findActiveBudgetsByUser(userId)
  // findBudgetPeriod(budgetId)
  // findBudgetLimit(budgetId)
  // isBudgetMonthly(budgetId)

  // Validation / Ownership
  // verifyUserOwnBudget(userId, budgetId)

  // Update
  // updateBudget(budgetId, data)
  // updateBudgetLimit(budgetId, amount)
  // updateBudgetPeriod(budgetId, period_start, period_end)
  // updateCurrentAmount(budgetId, amount) (cache only)

  // Lifecycle
  // resetCurrentAmount(budgetId)
  // closeBudget(budgetId) (set period_end)

  // Delete

  // deleteBudget(budgetId)
  async createBudget(data) {
    const id = `budget-${nanoid(16)}`;
    return this._prisma.budget.create({
      data: {
        id,
        ...data,
      },
      select: { id: true },
    });
  }

  async findBudgetById(budgetId) {
    return this._prisma.budget.findFirst({
      where: { id: budgetId },
      select: {
        id: true,
        budget_name: true,
        type: true,
        amount_limit: true,
        current_amount: true,
        period_start: true,
        period_end: true,
        last_reset_at: true,
      },
    });
  }

  async findAllBudgetsByUser(userId) {
    return this._prisma.budget.findMany({
      where: { user_id: userId },
      select: {
        id: true,
        budget_name: true,
        type: true,
        amount_limit: true,
        current_amount: true,
      },
    });
  }

  async findMonthlyBudget() {
    return prisma.budget.findMany({
      where: {
        type: "Monthly",
      },
    });
  }

  async verifyUserOwnBudget(userId, budgetId) {
    return this._prisma.budget.findUnique({
      where: { id: budgetId, user_id: userId },
      select: { id: true },
    });
  }

  async updateBudget(budgetId, data) {
    return this._prisma.budget.update({
      where: {
        id: budgetId,
      },
      data,
      select: { id: true },
    });
  }

  async updateBudgetLimit(budgetId, amount) {
    return this._prisma.budget.update({
      where: {
        id: budgetId,
      },
      data: { amount_limit: amount },
      select: { id: true },
    });
  }

  async decreaseCurrentAmountBudget(budgetId, amount) {
    return this._prisma.budget.update({
      where: {
        id: budgetId,
      },
      data: {
        current_amount: {
          decrement: amount,
        },
      },
      select: { id: true },
    });
  }

  async increaseCurrentAmountBudget(budgetId, amount) {
    return this._prisma.budget.update({
      where: {
        id: budgetId,
      },
      data: {
        current_amount: {
          increment: amount,
        },
      },
      select: { id: true },
    });
  }

  async deleteBudget(budgetId) {
    return this._prisma.budget.delete({
      where: { id: budgetId },
      select: { id: true },
    });
  }

  //   🔗 B. BUDGET CATEGORY (tabel budget_categories)
  // Peran: kategori apa saja yang dihitung ke budget

  // Create
  // attachCategoryToBudget(budgetId, categoryId)
  // attachCategoriesToBudget(budgetId, categoryIds)

  // Read
  // findCategoriesByBudget(budgetId)
  // verifyCategoryInBudget(budgetId, categoryId)

  // Delete
  // removeCategoryFromBudget(budgetId, categoryId)
  // removeAllCategoriesFromBudget(budgetId)

  // budget_categories Table
  async attachCategoryToBudget(budgetId, categoryId) {
    const id = `budgetCategory-${nanoid(16)}`;
    return this._prisma.budgetCategory.create({
      data: { id, budget_id: budgetId, category_id: categoryId },
    });
  }

  async removeCategoryFromBudget(budgetId, categoryId) {
    return this._prisma.budgetCategory.delete({
      where: { budget_id: budgetId, category_id: categoryId },
    });
  }

  async removeAllCategoryFromBudget(budgetId) {
    return this._prisma.budgetCategory.deleteMany({
      where: {
        budget_id: budgetId,
      },
    });
  }

  //   📊 C. BUDGET USAGE (tabel budget_usages)
  // Peran: histori pemakaian per periode

  // Create
  // createBudgetUsage(budgetId, period_start, period_end)

  // Read
  // findUsageById(usageId)
  // findUsageByBudgetAndPeriod(budgetId, period_start)
  // findUsagesByBudget(budgetId)
  // findUsageByDate(budgetId, transaction_date)
  // findCurrentUsage(budgetId)

  // Update
  // increaseUsedAmount(usageId, amount)
  // decreaseUsedAmount(usageId, amount)
  // setUsedAmount(usageId, amount) (recalculation)

  // Validation
  // verifyUsageExist(budgetId, period_start)

  // budget_usage Table
  async createBudgetUsage(budgetId, period_start, period_end) {
    const id = `budgetUsage-${nanoid(16)}`;
    return this._prisma.budgetUsage.create({
      data: {
        id,
        budget_id: budgetId,
        period_start,
        period_end,
      },
    });
  }

  async findCurrentUsage(budgetId) {
    return this._prisma.budgetUsage.findFirst({
      where: { budget_id: budgetId },
    });
  }

  async findUsagesByBudget(budgetId) {
    return this._prisma.budgetUsage.findMany({
      where: { budget_id: budgetId },
    });
  }

  // for transaction
  async findUsageByBudgetPeriod(budgetId, transactionDate) {
    const date = new Date(transactionDate);
    return this._prisma.budgetUsage.findFirst({
      where: {
        budget_id: budgetId,
        period_start: {
          lte: date,
        },
        period_end: {
          gte: date,
        },
      },
      select: { id: true },
    });
  }

  async increaseUsedAmount(usageId, amount) {
    return this._prisma.budgetUsage.update({
      where: { id: usageId },
      data: {
        used_amount: {
          increment: amount,
        },
      },
    });
  }
  async decreaseUsedAmount(usageId, amount) {
    return this._prisma.budgetUsage.update({
      where: { id: usageId },
      data: {
        used_amount: {
          decrement: amount,
        },
      },
    });
  }

  // Bonus method
  async applyBudgetDelta(budgetId, amount) {
    // amount (+) = Nambah usage
    // amount (-) = Ngurangin Usage

    await this.decreaseCurrentAmountBudget(budgetId, amount);

    let usage = await this.findCurrentUsage(budgetId);

    if (!usage) {
      usage = await this.createBudgetUsage(
        budgetId,
        new Date().toISOString(),
        null,
      );
    }

    if (amount > 0) {
      await this.increaseUsedAmount(usage.id, amount);
    } else {
      await this.decreaseUsedAmount(usage.id, Math.abs(amount));
    }
  }

  async applyTransactionImpact({ oldData, newData }) {
    const isOldExpenses = oldData.type === "Expenses";
    const isNewExpenses = newData.type === "Expenses";

    const oldBudgetId = oldData.budget?.id ?? null;
    const newBudgetId = newData.budget_id ?? null;

    const getUsage = async (budgetId, date) => {
      if (!budgetId) return null;

      return this.findUsageByBudgetPeriod(budgetId, date);
    };

    const oldUsage = await getUsage(oldBudgetId, oldData.transaction_date);
    const newUsage = await getUsage(newBudgetId, newData.transaction_date);

    // ===============================
    // 🔥 CASE 1: Expense → Income
    // ===============================
    if (isOldExpenses && !isNewExpenses) {
      if (oldUsage) {
        await this.decreaseUsedAmount(oldUsage.id, oldData.amount);
      }

      if (oldBudgetId) {
        await this.decreaseCurrentAmountBudget(oldBudgetId, oldData.amount);
      }

      return;
    }

    // ===============================
    // 🔥 CASE 2: Income → Expense
    // ===============================
    if (!isOldExpenses && isNewExpenses) {
      if (newUsage) {
        await this.increaseUsedAmount(newUsage.id, newData.amount);
      }

      if (newBudgetId) {
        await this.increaseCurrentAmountBudget(newBudgetId, newData.amount);
      }
      return;
    }

    // ===============================
    // 🔥 CASE 3: Expense → Expense
    // ===============================
    if (isOldExpenses && isNewExpenses) {
      const sameBudget = oldBudgetId === newBudgetId;
      const sameUsage = oldUsage?.id === newUsage?.id;

      // Subcase A : sama semua => delta saja
      if (sameBudget && sameUsage) {
        const delta = newData.amount - oldData.amount;

        if (delta > 0) {
          await this.increaseUsedAmount(newUsage.id, delta);
          await this.increaseCurrentAmountBudget(newBudgetId, delta);
        } else if (delta < 0) {
          await this.decreaseUsedAmount(newUsage.id, Math.abs(delta));
          await this.decreaseCurrentAmountBudget(newUsage.id, Math.abs(delta));
        }

        return;
      }

      // Subcase B : pindah budget / periode
      if (oldUsage) {
        await this.decreaseUsedAmount(oldUsage.id, oldData.amount);
      }

      if (oldBudgetId) {
        await this.decreaseCurrentAmountBudget(oldBudgetId, oldData.amount);
      }

      if (newUsage) {
        await this.increaseUsedAmount(newUsage.id, newData.amount);
      }

      if (newBudgetId) {
        await this.increaseCurrentAmountBudget(newBudgetId, newData.amount);
      }
    }
  }
}

module.exports = BudgetRepository;
