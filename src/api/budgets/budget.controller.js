class BudgetController {
  constructor(service) {
    this._service = service;
  }

  postBudgetHandler = async (req, res, next) => {
    const userId = req.user.id;
    const payload = req.body;
    try {
      const { budget_id } = await this._service.createBudget(userId, payload);
      res.status(201).json({
        status: "success",
        message: "Budget berhasil dibuat",
        data: {
          budget_id,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  getBudgetsperUserHandler = async (req, res, next) => {
    const userId = req.user.id;

    try {
      const data = await this._service.getAllBudgetPerUser(userId);
      res.json({
        status: "success",
        message: "Data budget User berhasil diambil",
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  getOneBudgetByIdperUserHandler = async (req, res, next) => {
    const userId = req.user.id;
    const budgetId = req.params.id;

    try {
      const data = await this._service.getOneBudgetByIdPerUser(
        userId,
        budgetId,
      );

      res.json({
        status: "success",
        message: "Data satu budget berhasil diambil",
        data,
      });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = BudgetController;
