const prisma = require("../config/prisma");
const supabase = require("../config/supabase");
const bcrypt = require("bcrypt");

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

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
