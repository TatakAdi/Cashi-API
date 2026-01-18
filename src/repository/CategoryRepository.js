const { nanoid } = require("nanoid");

class CategoryRepository {
  constructor(prisma) {
    this._prisma = prisma;
  }

  async getGlobalCategories() {
    return this._prisma.category.findMany({
      where: {
        is_global: true,
      },
      select: { id: true },
    });
  }

  async attachCategoriesToUser(userId, categoryIds) {
    const data = categoryIds.map((categoryId) => ({
      id: `userCategory-${nanoid(16)}`,
      user_id: userId,
      category_id: categoryId,
    }));

    return this._prisma.userCategory.createMany({
      data,
      skipDuplicates: true,
    });
  }
  async createCategory(data) {
    const id = `category-${nanoid(16)}`;
    return this._prisma.category.create({
      data: { id, ...data },
      select: { id: true },
    });
  }

  async attachNewCategoryFromUser(userId, categoryId) {
    return this._prisma.userCategory.create({
      data: {
        user_id: userId,
        category_id: categoryId,
      },
    });
  }

  async verifyGlobalCategory(categoryId) {
    return this._prisma.category.findUnique({
      where: { id: categoryId },
      select: { is_global: true },
    });
  }

  async getAllCategoryOneUser(userId, filters = {}) {
    const where = {
      user_id: userId,
    };

    if (filters.type) {
      where.category = {
        type: filters.type,
      };
    }
    return this._prisma.userCategory.findMany({
      where,
      select: {
        id: true,
        category: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: { category: { name: "asc" } },
    });
  }

  async findOneUserCategory(userId, categoryId) {
    return this._prisma.userCategory.findFirst({
      where: { user_id: userId, category_id: categoryId },
      select: {
        category: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });
  }

  async findCategory(categoryId) {
    return this._prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });
  }

  async verifyUserOwnCategory(userId, categoryId) {
    return this._prisma.userCategory.findFirst({
      where: { user_id: userId, category_id: categoryId },
      select: { id: true },
    });
  }

  async updateCategory(categoryId, { data }) {
    return this._prisma.category.update({
      where: { id: categoryId },
      data,
    });
  }

  async deleteCategory(categoryId) {
    return this._prisma.category.delete({
      where: { id: categoryId },
    });
  }

  async removeCategoryFromUser(userId, categoryId) {
    return this._prisma.userCategory.delete({
      where: { user_id: userId, category_id: categoryId },
    });
  }
}

module.exports = CategoryRepository;
