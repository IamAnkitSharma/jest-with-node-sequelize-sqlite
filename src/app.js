const express = require("express");
const UserRouter = require("./routes/user");

const app = express();


app.use(express.json());

app.use("/api/1.0", UserRouter);

module.exports = app;
