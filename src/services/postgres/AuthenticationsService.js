const { nanoid } = require("nanoid");
const prisma = require("../../config/prisma");
const supabase = require("../../config/supabase");
const bcrypt = require("bcrypt");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthenticationError = require("../../exceptions/AuthenticationError");

class AuthenticationService {
  constructor() {}

  async login({ identity, password }) {
    let email = identity;

    if (!identity.includes("@")) {
      const user = await prisma.user.findUnique({
        where: { username: identity },
      });

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

    await prisma.authentication.create({
      data: {
        id: id,
        refresh_token: data.session.refresh_token,
        user_id: data.user.id,
      },
    });

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  }

  async refreshAccessToken(refreshToken) {
    const storedToken = await prisma.authentication.findUnique({
      where: { refresh_token: refreshToken },
    });

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

    await prisma.authentication.update({
      where: { refresh_token: refreshToken },
      data: { refresh_token: newRefreshToken },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken) {
    await prisma.authentication.delete({
      where: { refresh_token: refreshToken },
    });
  }
}

module.exports = AuthenticationService;
