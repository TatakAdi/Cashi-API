const prisma = require("../config/prisma");
const { formatDate } = require("../config/formatDate");

exports.getAllBudgetperUser = async (req, res) => {
  const userId = req.user.sub;
  try {
    const data = await prisma.budget.findMany({
      where: {
        user_id: userId,
      },
      include: {
        category: {
          select: {
            categoryName: true,
          },
        },
      },
    });
    if (data === null) {
      return res
        .status(400)
        .json({ succes: false, message: "Gagal mengambil data budget user" });
    }

    const result = data.map((item) => ({
      id: item.id,
      budgetName: item.budgetName,
      amount_limit: item.amount_limit,
      current_amount: item.current_amount,
      category: item.category.categoryName,
      Month: item.Month,
      Year: item.Year,
      created_at: formatDate(item.created_at),
      updated_at: formatDate(item.created_at),
    }));

    res.status(200).json({
      succes: true,
      message: "Data budget berhasil diambil",
      data: result,
    });
  } catch (error) {
    console.error("Internal server error: ", error);
    res
      .status(500)
      .json({ succes: false, message: "Internal server error", error: error });
  }
};

exports.getOneBudgetperUser = async (req, res) => {
  const userId = req.user.id;
  const budgetId = parseInt(req.params.id);

  try {
    const data = await prisma.budget.findFirst({
      where: { user_id: userId, id: budgetId },
      include: { category: { select: { categoryName: true } } },
    });

    if (data === null) {
      return res
        .status(400)
        .json({ succes: false, message: "Gagal mengambil data budget user" });
    }

    res.status(200).json({
      succes: true,
      message: "Data budget berhasil diambil",
      data: {
        budgetName: data.budgetName,
        amount_limit: data.amount_limit,
        current_amount: data.current_amount,
        category: data.category.categoryName,
        Month: data.Month,
        Year: data.Year,
        created_at: formatDate(data.created_at),
        updated_at: formatDate(data.created_at),
      },
    });
  } catch (error) {
    console.error("Internal server error: ", error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error", error: error });
  }
};

exports.createBudget = async (req, res) => {
  const userId = req.user.id;
  const { budgetName, amount, category, Month, Year } = req.body;
  try {
    const existCategory = await prisma.category.findFirst({
      where: {
        categoryName: category,
      },
    });

    if (!existCategory) {
      return res
        .status(403)
        .json({ succes: false, message: "Kategori belum dibuat" });
    }

    const existBudget = await prisma.budget.findFirst({
      where: {
        budgetName: budgetName,
        category_id: existCategory.id,
        user_id: userId,
        Year: Year,
        Month: Month,
      },
    });

    if (existBudget) {
      return res
        .status(403)
        .json({ succes: false, message: "Budget sudah pernah dibuat" });
    }

    const newBudget = {
      budgetName,
      amount_limit: amount,
      current_amount: amount,
      Month,
      Year,
    };

    await prisma.budget.create({
      data: {
        ...newBudget,
        category_id: existCategory.id,
        user_id: userId,
      },
    });

    res.status(201).json({
      succes: true,
      message: "Budget baru berhasil dibuat",
      data: {
        ...newBudget,
        category,
      },
    });
  } catch (error) {
    console.error("Internal server error: ", error);
    res
      .status(500)
      .json({ succes: false, message: "Internal server error", error: error });
  }
};

exports.updateBudget = async (req, res) => {
  const userId = req.user.id;
  const budgetId = parseInt(req.params.id);
  const { budgetName, category, Month, Year, amount } = req.body;

  try {
    const existBudget = await prisma.budget.findFirst({
      where: { user_id: userId, id: budgetId },
    });

    if (!existBudget) {
      console.log("Budget tidak dapat ditemukan");
      return res
        .status(404)
        .json({ succes: false, message: "Budget tidak dapat ditemukan" });
    }

    const updatedData = {};
    if (budgetName !== undefined && budgetName !== "") {
      updatedData.budgetName = budgetName;
    }
    if (Year !== undefined && Year !== "") {
      updatedData.Year = Year;
    }

    if (Month !== undefined && Month !== "") {
      const monthArray = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      if (monthArray.includes(Month)) {
        updatedData.Month = Month;
      }
    }

    if (category !== undefined && category !== "") {
      const existCategory = await prisma.category.findFirst({
        where: { user_id: userId, categoryName: category },
      });

      if (!existCategory) {
        console.log("Data kategori yang ingin diperbarui belum terdata");
        return res.status(403).json({
          success: false,
          message: "Data kategori yang ingin diperbarui belum terdata",
        });
      }

      updatedData.category = category;
    }

    if (amount !== undefined && amount !== "") {
      const oldAmountLimit = existBudget.amount_limit;
      const oldCurrentAmount = existBudget.current_amount;
      const diff = oldAmountLimit - oldCurrentAmount;

      updatedData.amount_limit = amount;
      updatedData.current_amount = amount - diff;
    }

    await prisma.budget.update({
      where: { user_id: userId, id: budgetId },
      data: { ...updatedData, updated_at: new Date() },
    });

    res.status(200).json({
      success: true,
      message: "Data budget berhasil diperbarui",
      data: { ...updatedData },
    });
  } catch (error) {
    console.error("Internal server error: ", error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error", error: error });
  }
};

exports.deleteBudget = async (req, res) => {
  const userId = req.user.id;
  const budgetId = parseInt(req.params.id);

  try {
    const existBudget = await prisma.budget.findFirst({
      where: { user_id: userId, id: budgetId },
    });

    if (!existBudget) {
      console.log("Budget yang ingin dihapus tidak ada di database");
      return res.status(404).json({
        success: false,
        message: "Budget yang ingin dihapus tidak ada di database",
      });
    }

    //update data transaksi yang memiliki budget
    await prisma.transaction.updateMany({
      where: { user_id: userId, budget_id: budgetId },
      data: { budget_id: null },
    });

    // Delete budget
    await prisma.budget.delete({
      where: { user_id: userId, id: budgetId },
    });

    res
      .status(200)
      .json({ success: true, message: "Data budget berhasil dihapuskan" });
  } catch (err) {
    console.error("Internal server error: ", err);
    res
      .status(500)
      .json({ success: false, message: "Internal server error", error: err });
  }
};
