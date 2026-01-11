class AuthenticationsHandler {
  constructor(service) {
    this._service = service;
  }

  loginHandler = async (req, res, next) => {
    try {
      const { identity, password } = req.body;

      const tokens = await this._service.login({ identity, password });

      res.json({
        status: "success",
        message: "Login success",
        data: tokens,
      });
    } catch (err) {
      next(err);
    }
  };

  refreshTokenVerifyHandler = async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      const tokens = await this._service.refreshAccessToken(refreshToken);
      res.json({
        status: "success",
        data: tokens,
      });
    } catch (err) {
      next(err);
    }
  };

  logoutHandler = async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      await this._service.logout(refreshToken);

      res.json({
        status: "success",
        message: "Logout sukses",
      });
    } catch (err) {
      next(err);
    }
  };
}
module.exports = AuthenticationsHandler;
