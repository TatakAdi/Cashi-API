class UsersRepository {
  constructor(prisma) {
    this._prisma = prisma;
  }

  async create(data) {
    return this._prisma.user.create({ data });
  }

  async findById(id) {
    return this._prisma.user.findUnique({
      where: { id },
      select: {
        email: true,
        fullname: true,
        username: true,
        balance: true,
      },
    });
  }

  async updateBalance(userId, amount) {
    return this._prisma.user.update({
      where: { id: userId },
      data: {
        balance: amount,
      },
    });
  }

  async increaseBalance(userId, amount) {
    return this._prisma.user.update({
      where: { id: userId },
      data: {
        balance: {
          increment: amount,
        },
      },
    });
  }

  async decreaseBalance(userId, amount) {
    return this._prisma.user.update({
      where: { id: userId },
      data: {
        balance: {
          decrement: amount,
        },
      },
    });
  }
}

module.exports = UsersRepository;
