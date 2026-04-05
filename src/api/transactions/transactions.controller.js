class TransactionController {
  constructor(service) {
    this._service = service;
  }

  postTransactionHandler = async (req, res, next) => {
    const userId = req.user.id;
    const payload = req.body;

    try {
      const data = await this._service.createTransaction(userId, payload);

      res.status(201).json({
        status: "success",
        message: "Transaksi berhasil dibuat",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getTransactionsHandler = async (req, res, next) => {
    const userId = req.user.id;
    const query = req.query;

    try {
      const data = await this._service.getAllTransactions(userId, query);

      res.json({
        status: "success",
        message: "Data transaksi berhasil diambil",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getTransactionByIdHandler = async (req, res, next) => {
    const userId = req.user.id;
    const transactionId = req.params.id;

    try {
      const data = await this._service.getOneTransactionById(
        userId,
        transactionId,
      );

      res.json({
        status: "success",
        message: "Data satu transaksi berhasil diambil",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  putTransactionByIdHandler = async (req, res, next) => {
    const userId = req.user.id;
    const transactionId = req.params.id;
    const payload = req.body;

    try {
      const data = await this._service.updateOneTransactionById(
        userId,
        transactionId,
        payload,
      );

      res.json({
        status: "success",
        message: "Data transaksi berhasil diperbarui",
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  deleteTransactionByIdHandler = async (req, res, next) => {
    const userId = req.user.id;
    const transactionId = req.params.id;

    try {
      const data = await this._service.deleteOneTransactionById(
        userId,
        transactionId,
      );

      res.json({
        status: "success",
        message: "Data satu transaksi berhasil dihapus",
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = TransactionController;
