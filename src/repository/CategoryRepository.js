class CategoryRepository {
  constructor(prisma) {
    this._prisma = prisma;
  }

  async getGlobalCategories() {
    return this._prisma.category.findMany({
      where: {
        is_global: true,
        owner_id: null,
      },
      select: { id: true },
    });
  }

  async attachCategoriesToUser(userId, categoryIds) {
    const data = categoryIds.map((categoryId) => ({
      user_id: userId,
      category_id: categoryId,
    }));

    return this._prisma.usersCategory.createMany({
      data,
      skipDuplicates: true,
    });
  }
}

module.exports = CategoryRepository;
