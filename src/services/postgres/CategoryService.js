const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthenticationError = require("../../exceptions/AuthenticationError");

class CategoryService {
  constructor() {
    this._prisma = prisma;
    this._supabase = supabase;
  }

  async createNewCategory(payload) {
    const { name, type } = payload;
  }
}
