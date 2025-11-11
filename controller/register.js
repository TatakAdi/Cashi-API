const prisma = require("../config/prisma");
const supabase = require("../config/supabase");
const bcrypt = require("bcrypt");

const defaultCategories = [
  // Expenses
  { name: "Makanan & Minuman", type: "expense" },
  { name: "Transportasi", type: "expense" },
  { name: "Belanja", type: "expense" },
  { name: "Hiburan", type: "expense" },
  { name: "Tagihan", type: "expense" },
  { name: "Pendidikan", type: "expense" },
  { name: "Kesehatan", type: "expense" },
  { name: "Hadiah / Donasi", type: "expense" },
  { name: "Lainnya", type: "expense" },

  // Income
  { name: "Gaji", type: "income" },
  { name: "Bonus", type: "income" },
  { name: "Investasi", type: "income" },
  { name: "Hadiah", type: "income" },
  { name: "Lainnya", type: "income" },
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
