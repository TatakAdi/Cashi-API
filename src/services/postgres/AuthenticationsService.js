const { nanoid } = require("nanoid");
const supabase = require("../../config/supabase");

const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthenticationError = require("../../exceptions/AuthenticationError");

class AuthenticationService {
  constructor(repository) {
    this._repository = repository;
  }

  async login({ identity, password }) {
    let email = identity;

    if (!identity.includes("@")) {
      const user = await this._repository.findUserByUsername(identity);

      if (!user) {
        throw new NotFoundError("Username not found");
      }
      email = user.email;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new InvariantError(error.message);

    const id = `token-${nanoid(16)}`;

    await this._repository.saveRefreshToken({
      id: id,
      refreshToken: data.session.refresh_token,
      userId: data.user.id,
    });

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  }

  async refreshAccessToken(refreshToken) {
    const storedToken = await this._repository.findByRefreshToken(refreshToken);

    if (!storedToken) {
      throw new AuthenticationError("Invalid refresh token");
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      throw new AuthenticationError("Failed to refresh access token");
    }

    const newRefreshToken = data.session.refresh_token;
    const newAccessToken = data.session.access_token;

    await this._repository.updateRefreshToken(refreshToken, newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken) {
    await this._repository.deleteRefreshToken(refreshToken);
  }
}

module.exports = AuthenticationService;
