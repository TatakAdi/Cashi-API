const prisma = require("../config/prisma");
const { formatDate } = require("../config/formatDate");

/*
  yang perlu dibuat : 
  -GetAllCategory(for Admin); Done
  -GetAllCategory(perUser); Done
  -GetoneCategory(perUser); Done
  -AddCategory; Done
  -UpdateCategory; Done
  -DeleteCategory; Done
 */

exports.getAllCategory = async (req, res) => {
  try {
    const data = await prisma.category.findMany({
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (data === null) {
      return res
        .status(400)
        .json({ message: "Data kategori tidak bisa diambil" });
    }

    const result = data.map((item) => ({
      id: item.id,
      categoryName: item.categoryName,
      type: item.type,
      userName: item.user.name,
      created_at: formatDate(item.created_at),
      updated_at: formatDate(item.updated_at),
    }));

    return res
      .status(200)
      .json({ message: "Data semua category berhasil diambil", data: result });
  } catch (error) {
    console.error("Internal server error: ", error);
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

exports.getAllCategoryperUser = async (req, res) => {
  const userId = req.user.sub;
  try {
    const data = await prisma.category.findMany({
      where: {
        user_id: userId,
      },
    });

    if (data === null) {
      return res.status(400).json({
        message: "Data kategori seorang user tidak ada/tidak bisa diambil",
      });
    }

    const result = data.map((item) => ({
      id: item.id,
      categoryName: item.categoryName,
      type: item.type,
      created_at: formatDate(item.created_at),
      updated_at: formatDate(item.updated_at),
    }));

    return res.status(200).json({
      message: "Data kategori per user berhasil diambil",
      data: result,
    });
  } catch (error) {
    console.error("Internal server error: ", error);
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

exports.getOneCategoryperUser = async (req, res) => {
  const userId = req.user.sub;
  const categoryId = parseInt(req.params.id);

  try {
    const data = await prisma.category.findFirst({
      where: { id: categoryId, user_id: userId },
    });

    if (!data) {
      return res
        .status(404)
        .json({ succes: false, message: "Category tidak dapat ditemukan" });
    }

    res.status(200).json({
      succes: true,
      message: "Category berhasil diambil",
      data: {
        categoryId: data.id,
        categoryName: data.categoryName,
        type: data.type,
        created_at: formatDate(data.created_at),
        updated_at: formatDate(data.updated_at),
      },
    });
  } catch (error) {
    console.error("Internal server error: ", error);
    res
      .status(500)
      .json({ succes: false, message: "Internal; server error", error: error });
  }
};

exports.createCategory = async (req, res) => {
  const userId = req.user?.id;
  try {
    const { categoryName, type } = req.body;

    if (!categoryName || !type) {
      console.log("field categoryName dan/atau type wajib diisi!");
      return res.status(400).json({
        succes: false,
        message: "field categoryName dan/atau type wajib diisi!",
      });
    }

    if (!["Expenses", "Income"].includes(type)) {
      console.log('Tipe yang tersedia hanyalah "Expenses" dan "Income"!');
      return res.status(400).json({
        succes: false,
        message: 'Tipe yang tersedia hanyalah "Expenses" dan "Income"!',
      });
    }

    const existCategory = await prisma.category.findFirst({
      where: {
        categoryName,
        user_id: userId,
      },
    });

    if (existCategory) {
      return res.status(409).json({
        message: "Category dengan nama ini sudah dibuat",
      });
    }

    console.log(userId);
    const newCategory = {
      categoryName,
      type,
    };

    await prisma.category.create({
      data: {
        ...newCategory,
        user_id: userId,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    return res.status(201).json({
      succes: true,
      message: "Kategori baru berhasil dibuat",
      data: newCategory,
    });
  } catch (error) {
    console.error("Internal server error:", error);
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

exports.updateCategory = async (req, res) => {
  const userId = req.user.id;
  const categoryId = parseInt(req.params.id);
  try {
    const { categoryName, type } = req.body;

    const existCategory = await prisma.category.findFirst({
      where: {
        id: categoryId,
        user_id: userId,
      },
    });

    if (!existCategory) {
      console.log(
        "Category tidak dapat ditemukan sama sekali, buatlah terlebih dahulu"
      );
      return res.status(404).json({
        succes: false,
        message: "Category tidak dapat ditemukan, buatlah terlebih dahulu",
      });
    }

    const updateData = {};

    if (categoryName !== undefined && categoryName !== "")
      updateData.categoryName = categoryName;
    if (type !== undefined && ["Expenses", "Income"].includes(type))
      updateData.type = type;

    console.log(updateData.categoryName);
    console.log(updateData.type);

    await prisma.category.update({
      where: { id: categoryId, user_id: userId },
      data: {
        ...updateData,
        updated_at: new Date(),
      },
    });

    res.status(200).json({
      succes: true,
      message: "Category berhasil diupdate",
      data: updateData,
    });
  } catch (error) {
    console.error("Internal server error: ", error);
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

exports.deleteCategory = async (req, res) => {
  const userId = req.user.id;
  const categoryId = parseInt(req.params.id);

  try {
    const existCategory = await prisma.category.findFirst({
      where: { id: categoryId, user_id: userId },
    });

    if (!existCategory) {
      return res.status(404).json({ message: "Category tidak ditemukan" });
    }

    const usedInBudget = await prisma.budget.findFirst({
      where: { category_id: categoryId, user_id: userId },
    });

    const usedInTransaction = await prisma.transaction.findFirst({
      where: { category_id: categoryId, user_id: userId },
    });

    if (usedInBudget || usedInTransaction) {
      return res
        .status(400)
        .json({
          message:
            "Category tidak bisa dihapus karena masih digunakan di Budget atau Transaction, tidak dapat dihapus",
        });
    }

    await prisma.category.delete({
      where: { id: categoryId, user_id: userId },
    });

    res
      .status(200)
      .json({ succes: true, message: "Category berhasil dihapus" });
  } catch (error) {
    console.error("Internal server error: ", error);
    res
      .status(500)
      .json({ succes: false, message: "Internal server error", error: error });
  }
};
