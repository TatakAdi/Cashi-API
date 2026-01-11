require("dotenv").config();

const express = require("express");
const listEndpoints = require("express-list-endpoints");

const prisma = require("./config/prisma");

// Middleware
const AuthMiddleware = require("./middleware/authMiddleware");
const errorMiddleware = require("./middleware/errorMiddleware");

// Users
const users = require("./api/users");
const UsersService = require("./services/postgres/UsersService");
const UsersRepository = require("./repository/UsersRepository");

// Authentications
const authentication = require("./api/authentications");
const AuthenticationsService = require("./services/postgres/AuthenticationsService");
const AuthenticationsRepository = require("./repository/AuthenticationsRepository");

const app = express();
app.use(express.json());

const authMiddleware = AuthMiddleware();

const usersRepository = new UsersRepository(prisma);
const usersService = new UsersService(usersRepository);

const authenticationRepository = new AuthenticationsRepository(prisma);
const authenticationsService = new AuthenticationsService(
  authenticationRepository
);

app.use(
  "/users",
  users({
    service: usersService,
    authMiddleware,
  })
);

app.use(
  "/authentications",
  authentication({
    service: authenticationsService,
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
