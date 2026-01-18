const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthenticationError = require("../../exceptions/AuthenticationError");

class CategoryService {
  constructor(repository) {
    this._repository = repository;
  }

  async createNewCategory(userId, payload) {
    const { name, type } = payload;
    const result = await this._repository.createCategory({ name, type });

    if (!result) {
      throw new InvariantError("Input Kategori salah");
    }

    const categoryId = result.id;
    await this._repository.attachNewCategoryFromUser(
      userCategoryId,
      userId,
      categoryId,
    );
  }
}

module.exports = CategoryService;
