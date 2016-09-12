/**
 * Created by geramy on 14.02.2016.
 */
"use strict";

var fs = require('fs');
var fse = require('fs-extra');

class Backup{
    constructor() {
        if (ENV.automatedDBBackup) {
            setTimeout(this.runBackup.bind(this), ENV.automatedDBBackupTime);
        }
    }

    runBackup() {
        setTimeout(this.runBackup.bind(this), ENV.automatedDBBackupTime);
        g_database.query("SHOW TABLES", (function(err, result) {
            let backupTime = new Date().getTime();
            let dirName = ENV.backupPath + "/" + backupTime + "/";
            fse.ensureDir(dirName, (function () {
                let length = result.length;
                for (let i = 0; i < length; i++) {
                    this.saveTable(result[i].Tables_in_twitch_bot, dirName);
                }
            }).bind(this));
        }).bind(this));

        //check max dir
        fs.readdir(ENV.backupPath, function(err, files){
            if (!err && files) {
                if (ENV.maxAutomatedBackups !== -1 && files.length > ENV.maxAutomatedBackups) {

                    files.sort(function (a, b) {
                        a = parseInt(a);
                        b = parseInt(b);
                        return a - b;
                    });

                    for (let i = 0; i < (files.length - ENV.maxAutomatedBackups); i++) {
                        fse.remove(ENV.backupPath + files[i]);
                    }
                }
            }
        });
    }

    saveTable(tableName, dirName) {
        g_database.query("SELECT * FROM " + tableName, (function(err, result) {
            let fileContent = "TRUNCATE " + tableName + ";\n";
            let length = result.length;
            if (length > 0) {
                let keys = Object.keys(result[0]).join(",");
                for (let i = 0; i < length; i++) {
                    fileContent += ("INSERT INTO " + tableName + " (" + keys + ") VALUES (");

                    let objectAsArray = [];
                    for (let key in result[i]) {
                        if (result[i].hasOwnProperty(key)) {
                            objectAsArray.push(result[i][key]);
                        }
                    }

                    fileContent += ("'" + objectAsArray.join("','") + "');\n");
                }

                fs.writeFile(dirName + tableName + ".sql", fileContent, {flag: 'w'});
            }
        }).bind(this));
    }
}
module.exports = Backup;