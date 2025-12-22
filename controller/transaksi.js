const prisma = require("../config/prisma");
const { formatDate } = require("../config/formatDate");

/*To Do List : 
  -GetAllTransaksi(for Admin);
  -GetAllTransaksi(perUser); Done
  -GetoneTransaksi(perUser); Done
  -AddTransaksi; Done
  -UpdateTransaksi;
  -DeleteTransaksi;
*/

exports.getAllTransactionperUser = async (req, res) => {
  const userId = req.user.sub;
  try {
    const data = await prisma.transaction.findMany({
      where: { user_id: userId },
      include: {
        category: {
          select: {
            categoryName: true,
          },
        },
        budget: {
          select: {
            budgetName: true,
          },
        },
      },
    });

    if (data === null) {
      return res
        .status(400)
        .json({ message: "Data transaksi user tidak bisa diambil" });
    }

    const result = data.map((item) => ({
      id: item.id,
      transactionName: item.transactionName,
      type: item.type,
      category: item.category.categoryName,
      transactionDate: item.transactionDate,
      budget: item.budget?.budgetName ?? null,
      amount: item.amount,
      note: item.Note,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));

    res.status(200).json({
      succes: true,
      message: "Berhasil mengambil data transaksi user",
      data: result,
    });
  } catch (error) {
    console.error("Internal server error: ", error);
    res
      .status(500)
      .json({ succes: false, message: "Internal server error", error: error });
  }
};

exports.getOneTransactionperUser = async (req, res) => {
  const userId = req.user.id;
  const transactionId = parseInt(req.params.id);

  try {
    const data = await prisma.transaction.findFirst({
      where: { id: transactionId, user_id: userId },
      include: {
        category: {
          select: {
            categoryName: true,
          },
        },
        budget: {
          select: {
            budgetName: true,
          },
        },
      },
    });

    if (!data) {
      return res
        .status(404)
        .json({ succes: false, message: "Transaksi tidak dapat ditemukan" });
    }

    res.status(200).json({
      succes: true,
      message: "Transaksi berhasil diambil",
      data: {
        id: data.id,
        transactionName: data.transactionName,
        type: data.type,
        category: data.category.categoryName,
        transactionDate: data.transactionDate,
        budget: data.budget?.budgetName ?? null,
        amount: data.amount,
        note: data.Note,
        created_at: data.created_at,
        updated_at: data.updated_at,
      },
    });
  } catch (err) {
    console.error("Internal server error: ", err);
    res
      .status(500)
      .json({ succes: false, message: "Internal server error", error: err });
  }
};

exports.createTransaction = async (req, res) => {
  const userId = req.user.id;
  const {
    transactionName,
    transactionDate,
    amount,
    type,
    note,
    category,
    budget,
  } = req.body;
  try {
    const categoryData = await prisma.category.findFirst({
      where: {
        categoryName: category,
        user_id: userId,
      },
    });

    if (!categoryData) {
      return res.status(403).json({
        succes: false,
        message:
          "Nama category tidak ditemukan, silahkan membuatnya telebih dahulu.",
      });
    }

    let budgetData;

    if (budget && type === "Expenses") {
      budgetData = await prisma.budget.findFirst({
        where: {
          budgetName: budget,
          user_id: userId,
          category_id: categoryData.id,
        },
      });
    }

    const txDate = new Date(transactionDate);
    const txYear = txDate.getFullYear();
    const txMonth = txDate.getMonth() + 1;

    const monthMap = {
      1: "January",
      2: "February",
      3: "March",
      4: "April",
      5: "May",
      6: "June",
      7: "July",
      8: "August",
      9: "September",
      10: "October",
      11: "November",
      12: "December",
    };

    const txMonthString = monthMap[txMonth];

    const existTransaction = await prisma.transaction.findFirst({
      where: {
        transactionName: transactionName,
        user_id: userId,
        budget_id: budgetData?.id ?? null,
        type: type,
        transactionDate: txDate,
        category_id: categoryData.id,
      },
    });

    if (existTransaction) {
      return res.status(400).json({
        success: false,
        message:
          "Transaksi sudah pernah dibuat, silahkan edit saja ya, buang-buang file saja ",
      });
    }

    if (budgetData) {
      if ((budgetData.Year = txYear && budgetData.Month == txMonthString)) {
        await prisma.budget.update({
          where: {
            id: budgetData.id,
            category_id: categoryData.id,
            user_id: userId,
          },
          data: {
            current_amount: {
              decrement: amount,
            },
          },
        });
      } else {
        return res.status(400).json({
          succes: false,
          message:
            "Transaksi dengan periode budget yang sesuai tidak ditemukan",
        });
      }
    }

    const newTransaction = {
      transactionName,
      transactionDate: txDate,
      amount,
      type,
    };
    await prisma.transaction.create({
      data: {
        ...newTransaction,
        category_id: categoryData.id,
        budget_id: budgetData?.id ?? null,
        user_id: userId,
        Note: note ?? "",
      },
    });

    // Update balance User
    await prisma.user.update({
      where: { id: userId },
      data: {
        balance:
          type === "Income" ? { increment: amount } : { decrement: amount },
      },
    });

    res.status(201).json({
      succes: true,
      message: "Transaksi berhasil dibuat",
      data: {
        ...newTransaction,
        budget,
        category,
        note: note ?? "",
      },
    });
  } catch (error) {
    console.error("Internal server error:", error);
    res
      .status(500)
      .json({ succes: false, message: "Internal server error", error: error });
  }
};

exports.updateTransaction = async (req, res) => {
  const userId = req.user.id;
  const transactionId = parseInt(req.params.id);
  const { transactionName, transactionDate, category, type, budget, amount } =
    req.body;

  try {
    // Mencari transaksi yang ingin diupdate
    const existTransaction = await prisma.transaction.findFirst({
      where: { id: transactionId, user_id: userId },
    });

    if (!existTransaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transaksi tidak ditemukan" });
    }

    // Parse tanggal transaksi baru
    const txDate = new Date(transactionDate);
    const txYear = txDate.getFullYear();
    const txMonth = txDate.getMonth() + 1;

    const monthMap = {
      1: "January",
      2: "February",
      3: "March",
      4: "April",
      5: "May",
      6: "June",
      7: "July",
      8: "August",
      9: "September",
      10: "October",
      11: "November",
      12: "December",
    };

    const txMonthString = monthMap[txMonth];

    // Validasi category
    const existCategory = await prisma.category.findFirst({
      where: {
        categoryName: category,
        user_id: userId,
      },
    });

    if (!existCategory) {
      return res.status(404).json({
        success: false,
        message: "Category tidak ditemukan",
      });
    }

    // Validasi tipe category harus sesuai dengan tipe transaksi
    if (existCategory.type !== type) {
      return res.status(400).json({
        success: false,
        message: "Tipe category tidak sesuai dengan tipe transaksi",
      });
    }

    // Cari budget baru jika tipe adalah Expenses
    let newBudget = null;
    if (type === "Expenses" && budget) {
      newBudget = await prisma.budget.findFirst({
        where: {
          budgetName: budget,
          user_id: userId,
          Year: txYear,
          Month: txMonthString,
        },
      });

      if (!newBudget) {
        return res.status(404).json({
          success: false,
          message: "Budget tidak ditemukan untuk periode tersebut",
        });
      }
    }

    const oldAmount = existTransaction.amount;
    const oldType = existTransaction.type;
    const oldBudgetId = existTransaction.budget_id;

    // ========== ROLLBACK: Kembalikan efek transaksi lama ==========

    // 1. Kembalikan budget lama jika ada
    if (oldBudgetId !== null && oldType === "Expenses") {
      await prisma.budget.update({
        where: { id: oldBudgetId, user_id: userId },
        data: { current_amount: { increment: oldAmount } },
      });
    }

    // 2. Kembalikan balance user
    if (oldType === "Income") {
      await prisma.user.update({
        where: { id: userId },
        data: { balance: { decrement: oldAmount } },
      });
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: { balance: { increment: oldAmount } },
      });
    }

    // ========== APPLY: Terapkan efek transaksi baru ==========

    // 1. Kurangi budget baru jika ada
    if (newBudget && type === "Expenses") {
      await prisma.budget.update({
        where: { id: newBudget.id, user_id: userId },
        data: { current_amount: { decrement: amount } },
      });
    }

    // 2. Update balance user dengan nilai baru
    if (type === "Income") {
      await prisma.user.update({
        where: { id: userId },
        data: { balance: { increment: amount } },
      });
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: { balance: { decrement: amount } },
      });
    }

    // ========== UPDATE: Simpan perubahan transaksi ==========
    const updateData = {
      transactionName,
      transactionDate: txDate,
      amount,
      type,
      category_id: existCategory.id,
      budget_id: newBudget?.id || null,
    };

    await prisma.transaction.update({
      where: { id: transactionId, user_id: userId },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      message: "Transaksi berhasil diupdate",
      data: {
        transactionName,
        transactionDate: txDate,
        amount,
        type,
        category,
        budget: newBudget?.budgetName || null,
        updated_at: formatDate(+new Date()),
      },
    });
  } catch (err) {
    console.error("Internal server error: ", err);
    res
      .status(500)
      .json({ success: false, message: "Internal server error", error: err });
  }
};

exports.deleteTransaction = async (req, res) => {
  const userId = req.user.id;
  const transactionId = parseInt(req.params.id);

  try {
    const existTransaction = await prisma.transaction.findFirst({
      where: { id: transactionId, user_id: userId },
    });

    if (!existTransaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transaksi tidak ditemukan" });
    }

    if (existTransaction.budget_id !== null) {
      await prisma.budget.update({
        where: { id: existTransaction.budget_id, user_id: userId },
        data: { current_amount: { increment: existTransaction.amount } },
      });
    }

    if (existTransaction.type === "Income") {
      await prisma.user.update({
        where: { id: userId },
        data: { balance: { decrement: existTransaction.amount } },
      });
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: { balance: { increment: existTransaction.amount } },
      });
    }

    await prisma.transaction.delete({
      where: { id: transactionId, user_id: userId },
    });

    res
      .status(200)
      .json({ success: true, message: "Transaksi berhasil dihapus" });
  } catch (err) {
    console.error("Internal server error: ", err);
    res
      .status(500)
      .json({ success: false, message: "Internal server error", error: err });
  }
};
