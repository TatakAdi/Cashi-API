const prisma = require("../../config/prisma");

class HealthService {
  async check() {
    return prisma.user.count();
  }
}

module.exports = HealthService;
