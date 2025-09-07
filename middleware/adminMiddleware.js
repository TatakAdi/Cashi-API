const supabase = require("../config/supabase");
const prisma = require("../config/prisma");

exports.adminMiddleware = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "User belum login" });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { isAdmin: true },
  });

  if (!user || !user.isAdmin) {
    return res
      .status(403)
      .json({ message: "Akses ditolak, pengguna bukanlah seorang admin" });
  }

  next();
};
