const prisma = require("../config/prisma");
const { formatDate } = require("../config/formatDate");

/*To Do List : 
  -GetAllTransaksi(for Admin);
  -GetAllTransaksi(perUser);
  -GetoneTransaksi(perUser);
  -AddTransaksi;
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
      trasactionName: item.transactionName,
      type: item.type,
      category: item.category.categoryName,
      transactionDate: formatDate(item.transactionDate),
      budget:
        item.budget?.budgetName ??
        "Transaksi ini tidak terikat dengan budget apapun",
      amount: item.amount,
      note: item.Note,
      created_at: formatDate(item.created_at),
      updated_at: formatDate(item.updated_at),
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

    if (budget) {
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
      if ((budgetData.Year = txYear && budgetData.Month == txMonth)) {
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
