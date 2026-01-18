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
    await this._repository.attachNewCategoryFromUser(userId, categoryId);

    return categoryId;
  }

  async getAllCategoryPerUser(userId, type) {
    const result = await this._repository.getAllCategoryOneUser(userId, {
      type,
    });

    return result.map((item) => item.category);
  }

  async getOneCategoryById(userId, categoryId) {
    const result = await this._repository.verifyUserOwnCategory(
      userId,
      categoryId,
    );

    if (!result.id) {
      throw new NotFoundError("Kategori tidak ditemukan");
    }

    const data = await this._repository.findOneUserCategory(userId, categoryId);

    return data;
  }
}

module.exports = CategoryService;
