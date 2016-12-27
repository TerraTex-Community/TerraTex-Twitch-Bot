/**
 * Created by C5217649 on 23.03.2016.
 */
"use strict";

let Handlebars = require('handlebars');

Handlebars.registerHelper('helperMissing', function(/* [args, ] options */) {
    var options = arguments[arguments.length - 1];
    if (g_templateVars.hasOwnProperty(options.name)) {
        return g_templateVars[options.name];
    }

    let ex = new Handlebars.Exception('Unknown field: ' + options.name);
    console.error(ex);
    throw ex;
});