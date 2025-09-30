const prisma = require("../config/prisma");
const { formatDate } = require("../config/formatDate");
const supabase = require("../config/supabase");

exports.changePassword = async (req, res) => {
  const userId = req.user.id;
  const { newPassword } = req.body;

  try {
    await supabase.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: await bcrypt.hash(newPassword, 10),
        updatedAt: formatDate(new Date()),
      },
    });

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    console.log("Internal server error", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

exports.updateAmount = async (req, res) => {
  const userId = req.user.id;
  const { amount } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { balance: amount, updatedAt: formatDate(new Date()) },
    });

    res.status(200).json({
      success: true,
      message: "Balance updated successfully",
      data: { balance: amount },
    });
  } catch (err) {
    console.error("Internal server error", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

exports.editFullname = async (req, res) => {
  const userId = req.user.id;
  const { fullname } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { name: fullname, updatedAt: formatDate(new Date()) },
    });

    res.status(200).json({
      success: true,
      message: "Fullname updated successfully",
      data: { fullname: fullname },
    });
  } catch (err) {
    console.error("Internal server error", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};
