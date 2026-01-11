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
}

module.exports = UsersRepository;
