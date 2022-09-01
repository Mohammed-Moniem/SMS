const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const errorHandler = require("./middleware/error");
const connectDB = require("./config/db");
const path = require("path");
const bodyParser = require("body-parser");
const trimReqBody = require("trim-request-body");

const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");

const cors = require("cors");
const postResponse = require("./utils/postResponse");
const sendReplyEmail = require("./utils/sendReplyEmail");

const auth = require("./routes/auth");

// Load env variables
dotenv.config({ path: "./config/config.env" });

//Connect to database
connectDB();

const app = express();

//Body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.text({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
//Enabling cors origin
app.use(cors());

//Prevent NoSQL injections
app.use(mongoSanitize());

//Prevent XSS scripting
app.use(xss());

//Rate Limit
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10mins
  max: 10000,
});

app.use(limiter);

//Prevent http param pollution
app.use(hpp());

//Set security headers
app.use(helmet());

//Enable cookie parser
app.use(cookieParser());

// Trim the parsed request body.
app.use(trimReqBody);

// Dev loggin middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
//intercepts
app.use((req, res, next) => {
  res.on("finish", async () => {
    //Audit
    await postResponse(req, res);
  });
  next();
});

// Use Routes
app.use("/api/v1/auth", auth);

app.use(errorHandler);

const PORT = process.env.PORT || 8080;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`
      .yellow.bold
  )
);

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red.bold);
  //Close server & exit process
  server.close(() => process.exit(1));
});
