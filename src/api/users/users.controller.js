class UsersHandler {
  constructor(service) {
    this._service = service;
  }

  registerHandler = async (req, res, next) => {
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
  };

  getUserProfileHandler = async (req, res, next) => {
    try {
      const profile = await this._service.getUserProfile(req.user.id);
      res.json({
        status: "success",
        data: profile,
      });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = UsersHandler;
