/**
 * Created by C5217649 on 15.01.2016.
 */
"use strict";

class TimeHelper{

    /**
     * Formates minutes to format Years - Month - Days - Hours - Minutes from Minutes
     * @param {int} minutes - Minutes
     * @returns {string}
     */
    static minutesToLongTimeString(minutes) {
        let formatedDate;
        if (minutes > 60) {
            let rest = (minutes % 60);
            formatedDate = rest + " Minuten";

            minutes -= rest;
            minutes = minutes / 60;

            if (minutes > 24) {
                rest = minutes % 24;
                formatedDate = rest + " Stunden " + formatedDate;

                minutes -= rest;
                minutes = minutes / 24;

                if (minutes > 365) {
                    rest = minutes % 365;
                    formatedDate = rest + " Tage " + formatedDate;
                    minutes -= rest;
                    minutes = minutes / 365;

                    formatedDate = minutes + " Jahre " + formatedDate;
                } else {
                    formatedDate = minutes + " Tage " + formatedDate;
                }
            } else {
                formatedDate = minutes + " Stunden " + formatedDate;
            }
        } else {
            formatedDate = minutes + " Minuten";
        }

        return formatedDate;
    }

    /**
     * This Function returns a d.m.y h:m:s from date object
     * @param {Date} date - Dateobject
     * @returns {String}
     */
    static dateToDateString(date) {
        let output = (date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear());
        output += (" " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds());
        return output;
    }
}

module.exports = TimeHelper;
