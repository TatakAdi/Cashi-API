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
      transactionDate: item.transactionDate,
      budget:
        item.budget.budgetName ??
        "Transaksi ini tidak terikat dengan budget apapun",
      amount: item.amount,
      note: item.Note,
      created_at: formatDate(item.created_at),
      updated_at: item.updated_at,
    }));

    res
      .status(200)
      .json({
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
