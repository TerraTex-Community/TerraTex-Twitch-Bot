/**
 * Created by C5217649 on 14.03.2016.
 */
"use strict";

let hbs = require('hbs');
let Handlebars = require('handlebars');

let helper = {
    "time_MinuteToHour": function (v) {
        let h = Math.floor(v/60);
        v = v - (h * 60);

        if (v < 10) {
            return h + ":0" + v;
        } else {
            return h + ":" + v;
        }
    }
};

hbs.registerHelper(helper);
Handlebars.registerHelper(helper);
