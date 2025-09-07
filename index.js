require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/categories", categoryRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
