const prisma = require("../../config/prisma");
const supabase = require("../../config/supabase");
const bcrypt = require("bcrypt");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class UsersService {
  constructor() {}

  async register({ email, password, fullname, username }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw new InvariantError(error.message);

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        id: data.user.id,
        email,
        fullname,
        password: hashedPassword,
        username,
        balance: 0,
      },
    });
  }
  async getUserProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        fullname: true,
        username: true,
        balance: true,
        expense_categories: true,
        income_categories: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User tidak ditemukan");
    }

    return user;
  }
}

module.exports = UsersService;
