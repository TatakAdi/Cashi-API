const { nanoid } = require("nanoid");
const supabase = require("../../config/supabase");

const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthenticationError = require("../../exceptions/AuthenticationError");

class AuthenticationService {
  constructor(authenticationsRepository, usersRepository) {
    this._authenticationRepository = authenticationsRepository;
    this._usersRepository = usersRepository;
  }

  async login({ identity, password }) {
    let email = identity;

    if (!identity.includes("@")) {
      const user =
        await this._authenticationRepository.findUserByUsername(identity);

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

    await this._authenticationRepository.saveRefreshToken({
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
    const storedToken =
      await this._authenticationRepository.findByRefreshToken(refreshToken);

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

    await this._authenticationRepository.updateRefreshToken(
      refreshToken,
      newRefreshToken,
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken) {
    await this._authenticationRepository.deleteRefreshToken(refreshToken);
  }

  async getGoogleAuthUrl() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.API_URL}/authentications/google/callback`,
      },
    });

    if (error) {
      throw new InvariantError(error.message);
    }

    return data.url;
  }

  async handleGoogleCallback({ accessToken, refreshToken }) {
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data.user) {
      throw new AuthenticationError("Failed to retrieve Google User");
    }

    const user = data.user;

    const existingUser = await this._authenticationRepository.findUserByEmail(
      user.email,
    );

    let userId;

    if (!existingUser) {
      const username = user.email.split("@")[0];

      const newUser = await this._usersRepository.create({
        id: user.id,
        email: user.email,
        fullname: user.user_metadata?.full_name || username,
        username,
        password: null,
        balance: 0,
      });

      userId = newUser.id;
    } else {
      userId = existingUser.id;
    }

    const id = `token-${nanoid(16)}`;

    await this._authenticationRepository.saveRefreshToken({
      id,
      refreshToken,
      userId,
    });

    return { accessToken, refreshToken };
  }
}

module.exports = AuthenticationService;
