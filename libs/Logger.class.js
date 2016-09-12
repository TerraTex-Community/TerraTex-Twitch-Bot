/**
 * Created by C5217649 on 15.04.2016.
 */
"use strict";
let fs = require("fs");
let fse = require('fs-extra');

class Logger {
    constructor(logName) {
        this._logName = logName;
        this._states = ["log", "info", "warning", "error"];
        this._logPath = ENV.logPath;
        this._logFilePath = ENV.logPath + logName + ".log";

        fse.ensureFileSync(ENV.logPath + logName + ".log");

        // Write Start Up
        this.log("######################################################################################################", false, true);
        this.log("############################                 START NEW LOG                ############################", false, true);
        this.log("######################################################################################################", false, true);
    }

    /**
     *
     * @param logText
     * @param [writeLogOnLocal=true]
     * @param [writeSync=false]
     */
    log(logText, writeLogOnLocal, writeSync) {
        if (logText instanceof Error) {
            logText = logText.message + "\r\n" + logText.stack + "\r\n Errordata:" + JSON.stringify(logText);
        }
        writeSync = writeSync === true;
        writeLogOnLocal = writeLogOnLocal !== false;

        let date = Logger.getLogDate();
        let message = date + this._states[0] + " " + String(logText) + "\r\n";

        if (writeSync) {
            fs.appendFileSync(this._logFilePath, message);
        } else {
            fs.appendFile(this._logFilePath, message);
        }

        if (g_app.get('env') === 'development' && writeLogOnLocal) {
            console.log(message);
        }
    }

    /**
     *
     * @param logText
     * @param [writeLogOnLocal=true]
     * @param [writeSync=false]
     */
    info(logText, writeLogOnLocal, writeSync) {
        if (logText instanceof Error) {
            logText = logText.message + "\r\n" + logText.stack + "\r\n Errordata:" + JSON.stringify(logText);
        }
        writeSync = writeSync === true;
        writeLogOnLocal = writeLogOnLocal !== false;
        let date = Logger.getLogDate();
        let message = date + this._states[1] + " " + String(logText) + "\r\n";

        if (writeSync) {
            fs.appendFileSync(this._logFilePath, message);
        } else {
            fs.appendFile(this._logFilePath, message);
        }

        if (g_app.get('env') === 'development' && writeLogOnLocal) {
            console.info(message);
        }
    }

    /**
     *
     * @param logText
     * @param [writeLogOnLocal=true]
     * @param [writeSync=false]
     */
    warn(logText, writeLogOnLocal, writeSync) {
        if (logText instanceof Error) {
            logText = logText.message + "\r\n" + logText.stack + "\r\n Errordata:" + JSON.stringify(logText);
        }
        writeSync = writeSync === true;
        writeLogOnLocal = writeLogOnLocal !== false;
        let date = Logger.getLogDate();
        let message = date + this._states[2] + " " + String(logText) + "\r\n";

        if (writeSync) {
            fs.appendFileSync(this._logFilePath, message);
        } else {
            fs.appendFile(this._logFilePath, message);
        }

        if (g_app.get('env') === 'development' && writeLogOnLocal) {
            console.warn(message);
        }
    }

    /**
     *
     * @param logText
     * @param [writeLogOnLocal=true]
     * @param [writeSync=false]
     */
    error(logText, writeLogOnLocal, writeSync) {
        if (typeof logText !== "string") {
            logText = logText.message + "\r\n Stacktrace: " + (logText.stack || logText.stackTrace || "") + "\r\n Errordata: " + JSON.stringify(logText);
            logText += " \r\n \r\n ";
        } else {
            let e = new Error();
            logText = logText + "\r\n Stacktrace: " + (e.stack || e.stackTrace || "") + " \r\n \r\n ";
        }


        writeSync = writeSync === true;
        writeLogOnLocal = writeLogOnLocal !== false;
        let date = Logger.getLogDate();
        let message = date + this._states[3] + " " + String(logText) + "\r\n";

        if (writeSync) {
            fs.appendFileSync(this._logFilePath, message);
        } else {
            fs.appendFile(this._logFilePath, message);
        }

        if (g_app.get('env') === 'development' && writeLogOnLocal) {
            console.error(message);
        }
    }

    /**
     *
     * @returns {string}
     */
    static getLogDate() {
        let date = new Date();

        let dateString = "[";
        dateString += (date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate());
        dateString += "-";
        dateString += (date.getMonth() < 10 ? ("0" + date.getMonth()) : date.getMonth());
        dateString += "-";
        dateString += date.getFullYear();
        dateString += " ";
        dateString += (date.getHours() < 10 ? ("0" + date.getHours()) : date.getHours());
        dateString += ":";
        dateString += (date.getMinutes() < 10 ? ("0" + date.getMinutes()) : date.getMinutes());
        dateString += ":";
        dateString += (date.getSeconds() < 10 ? ("0" + date.getSeconds()) : date.getSeconds());
        dateString += "] ";

        return dateString;
    }


}
module.exports = Logger;
