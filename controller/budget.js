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
