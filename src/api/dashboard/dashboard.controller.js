class DashboardController {
  constructor(service) {
    this._service = service;
  }

  getDashboardTransactionHandler = async (req, res, next) => {
    const userId = req.user.id;

    try {
      const data = await this._service.getDashboardTransaction(userId);
      res.json({
        status: "success",
        message: "Data Transaksi untuk Dashboard berhasil diambil",
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = DashboardController;
