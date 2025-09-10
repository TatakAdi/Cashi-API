require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/categories", categoryRoutes);
app.use("/transactions", transactionRoutes);

module.exports = app;

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}
