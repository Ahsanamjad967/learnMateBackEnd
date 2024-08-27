const dotenv = require("dotenv").config();
const connectDb = require("./db/index");
const app = require("./app");

connectDb()
  .then((result) => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`The server is listening on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed");
  });
