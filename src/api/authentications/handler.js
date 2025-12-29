const autoBind = require("auto-bind").default;

class AuthenticationsHandler {
  constructor(service) {
    this._service = service;

    autoBind(this);
  }

  async registerHandler(req, res, next) {
    try {
      const { email, password, fullname, username } = req.body;

      await this._service.register({
        email,
        password,
        fullname,
        username,
      });

      res.status(201).json({
        status: "success",
        message: "User registered successfully",
      });
    } catch (err) {
      next(err);
    }
  }

  async loginHandler(req, res, next) {
    try {
      const { identity, password } = req.body;

      await this._service.login({ identity, password });

      res.json({
        status: "success",
        message: "Login success",
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthenticationsHandler;
