require("dotenv").config();

const express = require("express");
const listEndpoints = require("express-list-endpoints");

const prisma = require("./config/prisma");
const Supabase = require("./config/supabase");

// Authentications
const authentication = require("./api/authentications");
const AuthenticationsService = require("./services/postgres/AuthenticationsService");

const AuthMiddlewareFactory = require("./middleware/authMiddleware");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();
app.use(express.json());

const supabase = Supabase();

const authMiddleware = AuthMiddlewareFactory(supabase);

const authenticationsService = new AuthenticationsService(prisma, supabase);

app.use(
  "/auth",
  authentication({
    service: authenticationsService,
    middleware: authMiddleware,
  })
);

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.post("/debug", (req, res) => {
  res.json({ ok: true });
});

function listRoutes(app) {
  console.log("\n=== REGISTERED ROUTES ===");
  listEndpoints(app).forEach((route) => {
    console.log(route.methods.join(","), route.path);
  });
  console.log("========================\n");
}

listRoutes(app);
app.use(errorMiddleware);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
