const prisma = require("../config/prisma");
const supabase = require("../config/supabase");
const bcrypt = require("bcrypt");

const defaultCategories = [
  // Expenses
  { categoryName: "Makanan & Minuman", type: "Expenses" },
  { categoryName: "Transportasi", type: "Expenses" },
  { categoryName: "Belanja", type: "Expenses" },
  { categoryName: "Hiburan", type: "Expenses" },
  { categoryName: "Tagihan", type: "Expenses" },
  { categoryName: "Pendidikan", type: "Expenses" },
  { categoryName: "Kesehatan", type: "Expenses" },
  { categoryName: "Hadiah / Donasi", type: "Expenses" },
  { categoryName: "Lainnya", type: "Expenses" },

  // Income
  { categoryName: "Gaji", type: "Income" },
  { categoryName: "Bonus", type: "Income" },
  { categoryName: "Investasi", type: "Income" },
  { categoryName: "Hadiah", type: "Income" },
  { categoryName: "Lainnya", type: "Income" },
];

exports.register = async (req, res) => {
  const { email, password, fullname } = req.body;

  try {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) return res.status(400).json({ error: error.message });

    console.log(data.user);

    const user = {
      email,
      name: fullname,
      password: await bcrypt.hash(password, 10),
      balance: 1000,
      created_at: new Date(),
      updated_at: new Date(),
    };

    console.log(user);

    await prisma.user.create({
      data: {
        id: data.user.id,
        ...user,
      },
    });

    await prisma.category.createMany({
      data: defaultCategories.map((cat) => ({
        ...cat,
        user_id: data.user.id,
      })),
    });

    res.status(201).json({
      message:
        "User berhasil melakukan registrasi, silahkan konfirmasi email terlebih dahulu sebelum melanjutkan",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
