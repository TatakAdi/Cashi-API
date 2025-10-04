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
      budget:
        item.budget?.budgetName ??
        "Transaksi ini tidak terikat dengan budget apapun",
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
        transactionDate: formatDate(data.transactionDate),
        budget:
          data.budget?.budgetName ??
          "Transaksi ini tidak terikat dengan budget apapun",
        amount: data.amount,
        note: data.Note,
        created_at: formatDate(data.created_at),
        updated_at: formatDate(data.updated_at),
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

  const isFilled = (v) => v !== undefined && v !== "";

  try {
    // Mencari transaksi yang ingin diupdate datanya.
    const existTransaction = await prisma.transaction.findFirst({
      where: { id: transactionId, user_id: userId },
    });

    if (!existTransaction) {
      console.log("Transaksi tidak ditemukan, buat dulu sana gih!");
      return res
        .status(401)
        .json({ success: false, message: "Transaksi tidak ditemukan" });
    }

    // Membuat variabel tempat untuk mengupdate data
    const updateData = {};
    if (isFilled(transactionName)) {
      updateData.transactionName = transactionName;
    }

    const oldAmount = existTransaction?.amount;
    const newAmount = isFilled(amount) ? amount : oldAmount;
    if (isFilled(amount)) {
      updateData.amount = newAmount;
    }

    // Tentukan periode transaksi berdasarkan data transactionDate
    const txDate = isFilled(transactionDate)
      ? new Date(transactionDate)
      : new Date(existTransaction.transactionDate);
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

    // ================== Category ===================
    if (isFilled(category)) {
      const existCategory = await prisma.category.findFirst({
        where: {
          categoryName: category,
          user_id: userId,
        },
      });

      if (!existCategory) {
        console.log(
          "Update tidak dapat dilakukan karena category yang ingin diupdate belum terdata"
        );
        return res.status(403).json({
          succes: false,
          message:
            "Update tidak dapat dilakukan karena category yang ingin diupdate belum terdata",
        });
      }

      // Kalau perubahan category tidak dibarengi dengan perubahan tipe
      if (existCategory.type !== existTransaction.type && !isFilled(type)) {
        console.log(
          "Update tidak dapat dilakukan karena tipe category beda dengan tipe transaksi"
        );
        return res.status(403).json({
          succes: false,
          message:
            "Update tidak dapat dilakukan karena tipe category beda denga tipe transaksi",
        });
      }

      updateData.category = { connect: { id: existCategory.id } };
    }

    // ================== Budget ===================
    //Pengecekan apabila ada budget
    let existBudget;
    if (isFilled(budget)) {
      existBudget = await prisma.budget.findFirst({
        where: {
          budgetName: budget,
          user_id: userId,
          Year: txYear,
          Month: txMonthString,
        },
      });
    }

    let movedBudget = false;

    const hasOldBudget = existTransaction.budget_id !== null;
    let oldBudgetRecord;
    if (hasOldBudget) {
      oldBudgetRecord = await prisma.budget.findFirst({
        where: {
          id: existTransaction.budget_id,
          user_id: userId,
        },
      });
    }

    // ================= Jika hanya pindah tanggal saja ================
    if (
      isFilled(transactionDate) &&
      existTransaction.budget_id !== null &&
      !budget
    ) {
      movedBudget = true;
      const oldBudget = await prisma.budget.findFirst({
        where: {
          id: existTransaction.budget_id,
          user_id: userId,
        },
      });

      const newBudget = await prisma.budget.findFirst({
        where: {
          budgetName: oldBudget.budgetName,
          user_id: userId,
          Month: txMonthString,
          Year: txYear,
        },
      });

      if (!newBudget) {
        console.log("Budget dengan periode baru tidak ditemukan");
        return res.status(404).json({
          success: false,
          message: "Budget dengan periode baru tidak ditemukan",
        });
      }

      // Rollback budget lama dengan oldAmount
      await prisma.budget.update({
        where: { user_id: userId, id: oldBudget.id },
        data: { current_amount: { increment: oldAmount } },
      });

      // Tarik budget baru dengan newAmount
      await prisma.budget.update({
        where: { user_id: userId, id: newBudget.id },
        data: { current_amount: { decrement: newAmount } },
      });

      updateData.budget = { connect: { id: newBudget.id } };
    }

    // ================= Pergantian Type ===================
    // Pengecekan tipe transaksi
    if (isFilled(type)) {
      // Cek kalau tipe transaksi lama adalah Expenses
      if (existTransaction.type === "Expenses" && type === "Income") {
        // Ubah perubahan di budget kalau berpindah tipe.
        if (existTransaction.budget_id !== null) {
          await prisma.budget.update({
            where: { user_id: userId, id: existTransaction.budget_id },
            data: { current_amount: { increment: oldAmount } },
          });
        }
        updateData.budget = { disconnect: true };
      }
      updateData.type = type;
    }

    // ================= Pergantian Budget ===================
    // Pengecekan apabila ingin memperbarui data budget
    if (isFilled(budget)) {
      if (!existBudget) {
        console.log(
          "Update tidak dapat dilakukan karena budget yang ingin diupdate belum terdata"
        );
        return res.status(404).json({
          success: false,
          message:
            "Update tidak dapat dilakukan karena budget yang ingin diupdate belum terdata",
        });
      }

      // Serangkaian perubahan pada data-data budget:
      // 1. Apabila tipe tidak berubah namun budget ganti
      if (
        existTransaction.type === "Expenses" &&
        existTransaction.budget_id !== null &&
        existTransaction.budget_id !== existBudget.id
      ) {
        await prisma.budget.update({
          where: {
            user_id: userId,
            id: existTransaction.budget_id,
            Year: txYear,
            Month: txMonthString,
          },
          data: { current_amount: { increment: oldAmount } },
        });

        await prisma.budget.update({
          where: {
            user_id: userId,
            id: existBudget.id,
            Year: txYear,
            Month: txMonthString,
          },
          data: { current_amount: { decrement: newAmount } },
        });
      }
      //2. Apabila ada pergantian tipe
      else if ((existTransaction.type = "Income" && type === "Expenses")) {
        await prisma.budget.update({
          where: { user_id: userId, id: existBudget.id },
          data: { current_amount: { decrement: newAmount } }, // Kalau ada perubahan amount, utamakan amount
        });
      }
      // 3. Apabila dulu budget null dan sekarang berisi
      else if (existTransaction.budget_id === null) {
        await prisma.budget.update({
          where: { user_id: userId, id: existBudget.id },
          data: { current_amount: { decrement: newAmount } },
        });
      }

      updateData.budget = { connect: { id: existBudget.id } };
    }

    // 4. Apabila data budget tidak berubah, namun user melakukan perubahan amount
    if (
      (!movedBudget &&
        existTransaction.budget_id !== null &&
        isFilled(budget) &&
        existBudget &&
        existTransaction.budget_id === existBudget.id) ||
      (!isFilled(budget) && isFilled(amount))
    ) {
      const diff = Math.abs(newAmount - oldAmount);

      if (diff > 0) {
        await prisma.budget.update({
          where: { user_id: userId, id: existTransaction.budget_id },
          data: {
            current_amount:
              newAmount > oldAmount ? { decrement: diff } : { increment: diff },
          },
        });
      }
    }

    if (isFilled(transactionDate)) {
      updateData.transactionDate = txDate;
    }
    console.log(updateData);

    await prisma.transaction.update({
      where: { id: transactionId, user_id: userId },
      data: {
        ...updateData,
      },
    });

    // Perubahan pada balance user
    if (isFilled(amount)) {
      if (isFilled(type)) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            balance:
              type === "Income"
                ? { increment: newAmount - oldAmount }
                : { decrement: newAmount - oldAmount },
          },
        });
      } else {
        await prisma.user.update({
          where: { id: userId },
          data: {
            balance:
              existTransaction.type === "Income"
                ? { increment: newAmount - oldAmount }
                : { decrement: newAmount - oldAmount },
          },
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Transaksi berhasi diupdate",
      data: { ...updateData, updated_at: formatDate(+new Date()) },
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
