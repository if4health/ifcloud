const path = require("path");
const express = require("express");
const app = express();
const bp = require('body-parser');
const apiRouter = require('./routers/ApiRouter');
const directRouter = require('./routers/DirectRouter');
const operationRouter = require('./routers/OperationRouter');
require("dotenv").config();

const PORT = process.env.PORT || 8000;

let allowCrossDomain = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
}

app.set('view engine', 'ejs');
app.use(allowCrossDomain);

app.use(bp.json({limit: '50mb', extended: true}))
   .use(bp.urlencoded({limit: '50mb', extended: true }))
   .use('/ifcloud', apiRouter)
   .use('/ifcloud', directRouter)
   .use('/ifcloud', operationRouter)
   .use('/ifcloud', express.static(path.join(process.cwd(), "html_src")));

app.listen(PORT, () => {
  console.log("server started on port: " + PORT);
});
