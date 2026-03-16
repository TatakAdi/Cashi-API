const supabase = require("../../config/supabase");
const bcrypt = require("bcrypt");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class UsersService {
  constructor(usersRepository, categoryRepository) {
    this._usersRepository = usersRepository;
    this._categoryRepository = categoryRepository;
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
    const userId = data.user.id;

    await this._usersRepository.create({
      id: userId,
      email,
      password: hashedPassword,
      fullname,
      username,
      balance: 0,
    });

    const globalCategories =
      await this._categoryRepository.getGlobalCategories();
    await this._categoryRepository.attachCategoriesToUser(
      userId,
      globalCategories.map((c) => c.id),
    );
  }

  async getUserProfile(userId) {
    const user = await this._usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("User tidak ditemukan");
    }

    return user;
  }
}

module.exports = UsersService;
