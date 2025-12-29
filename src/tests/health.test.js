require("dotenv").config();
const HealthService = require("../services/postgres/HealthService");
(async () => {
  try {
    const service = new HealthService();
    const count = await service.check();

    console.log("✅ DB Connected");
    console.log("User count:", count);
  } catch (err) {
    console.error("❌ DB Error");
    console.error(err);
  } finally {
    process.exit();
  }
})();
