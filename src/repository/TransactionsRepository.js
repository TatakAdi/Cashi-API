/**
 * TransactionsRepository
 *
 * TODO LIST - Repository Methods untuk CRUD Transaksi
 * =====================================================
 */

const { nanoid } = require("nanoid");

class TransactionRepository {
  constructor(prisma) {
    this._prisma = prisma;
  }

  // ============================================
  // CREATE OPERATIONS
  // ============================================
  // TODO: addTransaction(transactionData)
  //       - Insert transaksi baru ke database
  //       - Parameter: { userId, categoryId, amount, type, description, transactionDate }
  //       - Return: Transaction object yang baru dibuat

  async createTransaction(data) {
    const id = `transactions-${nanoid(16)}`;

    return this._prisma.transaction.create({
      data: {
        id,
        ...data,
      },
      select: { id: true },
    });
  }

  // ============================================
  // READ OPERATIONS
  // ============================================
  // TODO: getTransactionById(transactionId)
  //       - Ambil detail transaksi berdasarkan ID
  //       - Return: Transaction object atau null jika tidak ditemukan

  async findTransationById(transactionId) {
    return this._prisma.transaction.findFirst({
      where: { id: transactionId },
      select: {
        id: true,
        transaction_name: true,
        type: true,
        amount: true,
        transaction_date: true,
        note: true,
        category: {
          select: {
            name: true,
          },
        },
        budget: {
          select: {
            budget_name: true,
          },
        },
      },
    });
  }

  // TODO: getTransactionsByUserId(userId, options)
  //       - Ambil semua transaksi milik user tertentu
  //       - Options: { limit, offset, sortBy, sortOrder }
  //       - Return: Array of transactions

  async findTransactionsByUser(userId, options = {}) {
    const { limit, type, page } = options;

    return this._prisma.transaction.findMany({
      where: { user_id: userId, ...(type && { type }) },
      select: {
        id: true,
        transaction_name: true,
        type: true,
        amount: true,
        transaction_date: true,
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        transaction_date: "desc",
      },
      ...(limit && { take: limit }),
      ...(page && limit && { skip: (page - 1) * limit }),
    });
  }

  // TODO: getTransactionsByCategory(userId, categoryId, options)
  //       - Ambil transaksi berdasarkan kategori tertentu
  //       - Return: Array of transactions dalam kategori tersebut

  // TODO: getTransactionsByDateRange(userId, startDate, endDate, options)
  //       - Ambil transaksi dalam rentang tanggal tertentu
  //       - Return: Array of transactions

  // TODO: getTransactionsByType(userId, type, options)
  //       - Ambil transaksi berdasarkan tipe (INCOME/EXPENSE)
  //       - Return: Array of transactions

  // TODO: getTransactionsWithFilters(userId, filters)
  //       - Ambil transaksi dengan multiple filter
  //       - Filters: { type, categoryId, minAmount, maxAmount, startDate, endDate, search }
  //       - Return: Array of transactions yang sesuai filter

  // TODO: getRecentTransactions(userId, limit)
  //       - Ambil transaksi terbaru user
  //       - Return: Array of recent transactions

  // ============================================
  // UPDATE OPERATIONS
  // ============================================
  // TODO: updateTransaction(transactionId, updateData)
  //       - Update data transaksi
  //       - UpdateData: { amount, type, description, categoryId, transactionDate }
  //       - Return: Updated transaction object

  // ============================================
  // DELETE OPERATIONS
  // ============================================
  // TODO: deleteTransaction(transactionId)
  //       - Soft delete atau hard delete transaksi
  //       - Return: Deleted transaction object atau boolean success

  async deleteTransaction(transactionId) {
    return this._prisma.transaction.delete({
      where: { id: transactionId },
      select: { id: true },
    });
  }

  // TODO: deleteTransactionsByUserId(userId)
  //       - Delete semua transaksi milik user (untuk cascade delete)
  //       - Return: Count of deleted transactions

  // ============================================
  // VALIDATION & HELPER OPERATIONS
  // ============================================
  // TODO: verifyTransactionOwner(transactionId, userId)
  //       - Cek apakah transaksi milik user tertentu
  //       - Return: boolean atau throw error jika bukan pemilik

  async verifyUserOwnTransaction(userId, transactionId) {
    return this._prisma.transaction.findUnique({
      where: { id: transactionId, user_id: userId },
      select: { id: true },
    });
  }

  // TODO: checkTransactionExists(transactionId)
  //       - Cek apakah transaksi ada di database
  //       - Return: boolean

  // ============================================
  // STATISTICS & ANALYTICS OPERATIONS
  // ============================================
  // TODO: getTransactionSummary(userId, startDate, endDate)
  //       - Hitung total income, expense, dan balance dalam periode tertentu
  //       - Return: { totalIncome, totalExpense, balance }

  // TODO: getTransactionsByMonth(userId, year, month)
  //       - Ambil semua transaksi dalam bulan tertentu
  //       - Return: Array of transactions

  // TODO: getCategoryTotal(userId, categoryId, startDate, endDate)
  //       - Hitung total pengeluaran/pemasukan per kategori
  //       - Return: Total amount untuk kategori tersebut

  // TODO: getMonthlyStatistics(userId, year)
  //       - Ambil statistik bulanan untuk satu tahun
  //       - Return: Array of monthly summaries

  // ============================================
  // EXPORT CLASS
  // ============================================
  // TODO: Export TransactionsRepository class dengan semua method di atas
}

module.exports = TransactionRepository;
