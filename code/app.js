// Load environment
require("./config/environment.js");

// Shared
const AppError = require("shared/error");
const Logger = require("shared/logger");

// Constants
const DOMAIN = process.env.DOMAIN;
const NODE_ENV = process.env.NODE_ENV;
const ENVIRONMENT = process.env.ENVIRONMENT;

// Express and body parsers
const express = require("express");
const app = express();
app.use(express.json({
  extended: true
}));
app.use(express.urlencoded({
  extended: true
}));

// Main only logs errors
const expressWinston = require("express-winston");
expressWinston.requestWhitelist = ["url", "method", "httpVersion", "originalUrl"];
app.use(expressWinston.logger({
  winstonInstance: Logger,
  skip: function (request, response) {
    if (response.statusCode < 400) {
      return true;
    }
    return false;
  }
}));

// Log unhandled rejections
process.on("unhandledRejection", error => {
  Logger.error(`unhandledRejection:
    ${error.stack}`);
});

// Basic Security
app.use(require("helmet")());

app.engine(".hbs", require("express-handlebars")({
  defaultLayout: "main",
  extname: ".hbs",
  partialsDir: __dirname + "/views/partials/"
}));
app.set("view engine", ".hbs");
app.locals.DOMAIN = DOMAIN;
//if (NODE_ENV === "production") {
  app.locals.S3_BUCKET = "https://lockdown-site-assets.s3.amazonaws.com";
//}
app.use(express.static("public"));

if (NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Landing Page
app.get("/", (request, response, next) => {
  return response.render("index");
});

// app.get(["/reviews"], (request, response, next) => {
//   return response.render("reviews");
// });

app.get(["/review/houseparty", "/houseparty"], (request, response, next) => {
  return response.render("reviewwrap", {
    reviewtitle: "Privacy Review: Houseparty",
    reviewimage: app.locals.S3_BUCKET + "/images/houseparty-report.png",
    reviewdescription: "Houseparty is the #1 downloaded Social Networking app. Read its Privacy Review to see what tracking it's doing with marketing and analytics companies."
  });
});

app.get(["/about", "/about.html"], (request, response, next) => {
  return response.render("about", {
    trackerimage: app.locals.S3_BUCKET + "/images/tracker-diagram.png"
  });
});

app.get(["/faq", "/faq.html"], (request, response, next) => {
  return response.render("faq");
});

app.get(["/privacy", "/privacy.html"], (request, response, next) => {
  return response.render("privacy");
});

app.get(["/terms", "/terms.html"], (request, response, next) => {
  return response.render("terms");
});

app.get("/error-test", (request, response, next) => {
  next(new AppError(500, 999, "Test alerts", "Details here"));
});

app.get("/health", (request, response, next) => {
  response.status(200).json({
    message: "OK from " + DOMAIN
  });
});

// Log Errors
app.use(expressWinston.errorLogger({
  winstonInstance: Logger
}));

// Handle Errors
app.use((error, request, response, next) => {
  if (response.headersSent) {
    Logger.error("RESPONSE ALREADY SENT");
    return;
  }
  else if (error.statusCode >= 200 && error.statusCode < 500) {
    response.status(error.statusCode).json({
      code: error.appCode,
      message: error.message
    });
  }
  else {
    response.status(500).json({
      code: -1,
      message: "Unknown Internal Error"
    });
  }
});

// Handle 404 Not Found
app.use((request, response, next) => {
  Logger.info("404 NOT FOUND - " + request.originalUrl);
  return response.status(404).json({
    code: 404,
    message: "Not Found"
  });
});

module.exports = app;