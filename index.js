const app = require("./src/app");

const sequelize = require("./src/config/database");

sequelize.sync();

app.listen(process.env.PORT || 3000, () => {
  console.log("App running on port 3000");
});

// module.exports = app
