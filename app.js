const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const studentRouter = require("./routes/student.router");
const noteRouter = require("./routes/note.router");
const ApiError = require("./utils/ApiError");
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/student", studentRouter);
app.use("/api/v1/notes", noteRouter);

app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    console.log(err);
    res.status(err.statusCode).json(err);
  } else {
    console.log(err);
    res.status(500).json(err.message);
  }
});

module.exports = app;
