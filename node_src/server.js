const path = require("path");
const express = require("express");
const app = express();
const bp = require('body-parser');
const apiRouter = require('./routers/ApiRouter');
const directRouter = require('./routers/DirectRouter');
const extensionRouter = require('./routers/ExtensionRouter');
const operationRouter = require('./routers/OperationRouter');
require("dotenv").config();

const PORT = process.env.SERVER_PORT;

let allowCrossDomain = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Headers', "*");
  next();
}

app.set('view engine', 'ejs');

app.use(bp.json({limit: '50mb', extended: true}))
  .use(bp.urlencoded({limit: '50mb',extended: true }))
  .use(apiRouter)
  .use('/ifcloud', directRouter)
  .use('/ifcloud', extensionRouter)
  .use('/ifcloud', operationRouter)
  .use(express.static(path.join(process.cwd(), "html_src")));

app.listen(PORT, () => {
  console.log("server started on port: " + PORT);
});
