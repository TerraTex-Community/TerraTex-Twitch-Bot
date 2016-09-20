/**
 * Created by C5217649 on 26.02.2016.
 */
"use strict";

let fs = require("fs");
let path = require("path");

fs.readdir(path.resolve(__dirname, 'helper'), function(err, files) {
    files.forEach(function(file) {
        g_logger.system.info("Load Handlebars Helper " + file);
        require("./helper/" + file);
    });
});