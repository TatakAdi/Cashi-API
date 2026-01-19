class CategoriesHandler {
  constructor(service) {
    this._service = service;
  }

  postCategoryHandler = async (req, res, next) => {
    const userId = req.user.id;
    const payload = req.body;
    try {
      const id = await this._service.createNewCategory(userId, payload);

      res.status(201).json({
        status: "success",
        message: "Kategori berhasil dibuat",
        data: {
          id,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getAllCategoryPerUserHandler = async (req, res, next) => {
    const userId = req.user.id;
    const type = req.query.type;
    try {
      const data = await this._service.getAllCategoryPerUser(userId, type);

      res.json({
        status: "success",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getOneCategoryByIdHandler = async (req, res, next) => {
    const userId = req.user.id;
    const categoryId = req.params.id;

    try {
      const data = await this._service.getOneCategoryById(userId, categoryId);

      res.json({
        status: "success",
        message: "Data kategori berhasil diambil",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  putCategoryByIdHandler = async (req, res, next) => {
    const userId = req.user.id;
    const categoryId = req.params.id;
    const payload = req.body;

    try {
      const data = await this._service.updateOneCategory(
        userId,
        categoryId,
        payload,
      );

      res.json({
        status: "success",
        message: "Kategori berhasil diupdate",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteCategoryByIdHandler = async (req, res, next) => {
    const userId = req.user.id;
    const categoryId = req.params.id;

    try {
      await this._service.deleteOneCategory(userId, categoryId);

      res.json({
        status: "Success",
        message: "Kategori berhasil dihapus",
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = CategoriesHandler;
