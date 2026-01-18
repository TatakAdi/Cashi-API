class CategoriesHandler {
  constructor(service) {
    this._service = service;
  }

  postCategoryHandler = async (req, res, next) => {
    const userId = req.user.id;
    const payload = req.body;
    try {
      await this._service.createNewCategory(userId, payload);

      res.status(201).json({
        status: "success",
        message: "Kategori berhasil dibuat",
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = CategoriesHandler;
