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
}

module.exports = BudgetController;
