const prisma = require("../config/prisma");

exports.getUser = async (req, res) => {
  const authUser = req.user;
  try {
    const profile = await prisma.user.findUnique({
      where: { id: authUser.id },
    });
    res.json({ authUser, profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
