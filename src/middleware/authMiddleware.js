const supabase = require("../config/supabase");
const AuthenticationError = require("../exceptions/AuthenticationError");

module.exports = () => {
  return async function authMiddleware(req, res, next) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        throw new AuthenticationError("Missing Authorization Error");
      }

      const token = authHeader.replace("Bearer ", "");

      const { data, error } = await supabase.auth.getUser(token);

      if (error) {
        throw new AuthenticationError("Invalid or expired token");
      }

      req.user = data.user;
      next();
    } catch (err) {
      next(err);
    }
  };
};
