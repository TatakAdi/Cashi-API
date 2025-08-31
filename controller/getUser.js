const prisma = require("../config/prisma");

exports.getUser = async (req, res) => {
  const authUser = req.user;
  try {
    const profile = await prisma.user.findUnique({
      where: { id: authUser.id },
    });
    res.status(200).json({
      message: "Fetching data user berhasil",
      data: {
        fullname: profile.name,
        email: profile.email,
        balance: profile.balance,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
