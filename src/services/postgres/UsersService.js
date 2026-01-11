const supabase = require("../../config/supabase");
const bcrypt = require("bcrypt");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class UsersService {
  constructor(usersRepository) {
    this.usersRepository = usersRepository;
  }

  async register(payload) {
    const { email, password, fullname, username } = payload;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new InvariantError(error.message);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.usersRepository.create({
      id: data.user.id,
      email,
      password: hashedPassword,
      fullname,
      username,
      balance: 0,
    });
  }

  async getProfile(userId) {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("User tidak ditemukan");
    }

    return user;
  }
}

module.exports = UsersService;
