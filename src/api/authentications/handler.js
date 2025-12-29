const autoBind = require("auto-bind").default;

class AuthenticationsHandler {
  constructor(service) {
    this._service = service;

    autoBind(this);
  }

  async loginHandler(req, res, next) {
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
  }

  async refreshTokenVerifyHandler(req, res, next) {
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
  }
}

module.exports = AuthenticationsHandler;
