'use strict';

var express = require('express');
var app = express();
var path = require("path");
var jpadCfg = require('./../../jpad.cfg.js');

var appPath = jpadCfg.appPath;
var port = jpadCfg.port;

var physdir = __dirname+'/../../build/client/'.replace(/\//g, path.sep);
app.use(appPath, express.static(physdir, {
  redirect: true
}));

app.listen(port, function() {
  console.log("Server is up");
});


