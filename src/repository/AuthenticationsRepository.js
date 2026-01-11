class AuthenticationsRepository {
  constructor(prisma) {
    this._prisma = prisma;
  }

  async findUserByUsername(username) {
    return this._prisma.user.findUnique({
      where: { username },
      select: {
        email: true,
      },
    });
  }

  async saveRefreshToken({ id, refreshToken, userId }) {
    return this._prisma.authentication.create({
      data: {
        id,
        refresh_token: refreshToken,
        user_id: userId,
      },
    });
  }

  async findByRefreshToken(refreshToken) {
    return this._prisma.authentication.findUnique({
      where: { refresh_token: refreshToken },
    });
  }

  async updateRefreshToken(oldToken, newToken) {
    return this._prisma.authentication.update({
      where: { refresh_token: oldToken },
      data: { refresh_token: newToken },
    });
  }

  async deleteRefreshToken(refreshToken) {
    return this._prisma.authentication.deleteMany({
      where: { refresh_token: refreshToken },
    });
  }
}

module.exports = AuthenticationsRepository;
