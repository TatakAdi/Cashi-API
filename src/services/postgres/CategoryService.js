const prisma = require("../../config/prisma");
const supabase = require("../../config/supabase");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthenticationError = require("../../exceptions/AuthenticationError");

class CategoryService {
  constructor() {
    this._prisma = prisma;
    this._supabase = supabase;
  }
}
