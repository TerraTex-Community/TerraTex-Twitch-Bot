/**
 * Created by geramy on 08.01.2016.
 */
"use strict";

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/*', function (req, res) {
    let fs = require("fs");
    fs.readFile("tmp/api_docs.html", function(err, content) {
         res.send(content.toString());
    });
});

module.exports = router;
