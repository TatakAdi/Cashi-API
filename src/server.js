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

// Category
const categories = require("./api/categories");
const CategoryRepository = require("./repository/CategoryRepository");
const CategoryService = require("./services/postgres/CategoryService");

// Budget
const budgets = require("./api/budgets");
const BudgetRepository = require("./repository/BudgetsRepository");
const BudgetService = require("./services/postgres/BudgetsService");

// Transactions
const transactions = require("./api/transactions");
const TransactionRepository = require("./repository/TransactionsRepository");
const TransactionService = require("./services/postgres/TransactionsService");

// Dashboard
const dashboard = require("./api/dashboard");
const DashboardService = require("./services/postgres/DashboardService");

const app = express();
app.use(express.json());

const authMiddleware = AuthMiddleware();

const categoryRepository = new CategoryRepository(prisma);
const usersRepository = new UsersRepository(prisma);
const authenticationRepository = new AuthenticationsRepository(prisma);
const budgetRepository = new BudgetRepository(prisma);
const transactionRepository = new TransactionRepository(prisma);

const usersService = new UsersService(usersRepository, categoryRepository);
const authenticationsService = new AuthenticationsService(
  authenticationRepository,
  usersRepository,
);
const categoryService = new CategoryService(categoryRepository);
const budgetService = new BudgetService(
  prisma,
  BudgetRepository,
  budgetRepository,
);
const transactionService = new TransactionService(
  usersRepository,
  categoryRepository,
  transactionRepository,
);
const dashboardService = new DashboardService(
  categoryRepository,
  transactionRepository,
);

app.use(
  "/users",
  users({
    service: usersService,
    authMiddleware,
  }),
);

app.use(
  "/authentications",
  authentication({
    service: authenticationsService,
  }),
);

app.use(
  "/categories",
  categories({ service: categoryService, authMiddleware }),
);

app.use("/budgets", budgets({ service: budgetService, authMiddleware }));

app.use(
  "/transactions",
  transactions({ service: transactionService, authMiddleware }),
);

app.use("/dashboard", dashboard({ service: dashboardService, authMiddleware }));

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
