/**
 * Created by C5217649 on 14.03.2016.
 */
"use strict";

let hbs = require('hbs');
let Handlebars = require('handlebars');

let counter = {};

let helper = {
    "math_floor": function (v) {
        return Math.floor(v);
    },
    "countUp": function (counterName) {
        if (counter.hasOwnProperty(counterName)) {
            counter[counterName]++;
        } else {
            counter[counterName] = 1;
        }
        return counter[counterName];
    },
    "countReset": function (counterName) {
        counter[counterName] = 0;
    }
};

hbs.registerHelper(helper);
Handlebars.registerHelper(helper);
