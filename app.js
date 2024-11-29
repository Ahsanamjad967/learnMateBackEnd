const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const studentRouter = require("./routes/student.router");
const documentRouter = require("./routes/document.router");
const counsellorRouter = require("./routes/counsellor.router");
const adminRouter = require("./routes/admin.router");
const meetingRouter = require("./routes/meeting.router");
const authRouter = require("./routes/auth.router");
const ApiError = require("./utils/ApiError");
const stripeRouter = require("./routes/stripe.router");
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/student", studentRouter);
app.use("/api/v1/documents", documentRouter);
app.use("/api/v1/counsellor", counsellorRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/meeting", meetingRouter);
app.use("/api/v1/stripe", stripeRouter);
app.use("/api/v1/auth", authRouter);

app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    console.log(err);
    res.status(err.statusCode).json(err.message);
  } else {
    console.log(err);
    res.status(500).json(err.message);
  }
});

module.exports = app;
