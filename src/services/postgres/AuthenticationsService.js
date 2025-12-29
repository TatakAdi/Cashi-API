const bcrypt = require("bcrypt");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class AuthenticationService {
  constructor(prisma, supabase) {
    this._prisma = prisma;
    this._supabase = supabase;
  }

  async register({ email, password, fullname, username }) {
    const { data, error } = await this._supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw new InvariantError(error.message);

    const hashedPassword = await bcrypt.hash(password, 10);

    await this._prisma.user.create({
      data: {
        id: data.user.id,
        email,
        fullname,
        password: hashedPassword,
        username,
        balance: 0,
      },
    });
  }

  async login({ identity, password }) {
    let email = identity;

    if (!identity.includes("@")) {
      const user = await this._prisma.user.findUnique({
        where: { username: identity },
      });

      if (!user) {
        throw new NotFoundError("Username not found");
      }
      email = user.email;
    }

    const { data, error } = await this._supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new InvariantError(error.message);

    await this._prisma.authentication.create({
      data: {
        refresh_token: data.session.refresh_token,
        user_id: data.user.id,
      },
    });
  }
}

module.exports = AuthenticationService;
