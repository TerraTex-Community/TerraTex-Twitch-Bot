/**
 * Created by C5217649 on 18.12.2015.
 */
"use strict";

class Database {
    constructor() {
        this.startConnection();
    }

    /**
     * Creates the connection to the database
     * @param runAfter a callback function that will be executet after the connection success
     */
    startConnection(runAfter) {
        let mysqlModule = require("mysql");

        let mysql = mysqlModule.createConnection({
            "host": g_configs.database.host,
            "user": g_configs.database.user,
            "password": g_configs.database.password,
            "database": g_configs.database.database,
            "connectTimeout": 10000000,
            "trace": true
        });

        mysql.config.queryFormat = function (query, values) {
             if (!values) {
                return query;
            }
            return query.replace(/:(\w+)/g, function (txt, key) {
                if (values.hasOwnProperty(key)) {
                    return this.escape(values[key]);
                }
                return txt;
            }.bind(this));
        };

        mysql.connect(function (err) {
            if (err) {
                console.error('error connecting: ' + err.stack);
                return;
            }

            if (runAfter) {
                runAfter();
            }

            console.info('Database connected');
        });

        this._mysql = mysql;
    }


    getInstance() {
        return this._mysql;
    }

    checkConnection(runAfter) {
        this._mysql.query('SELECT 1', function (err) {
            if (err) {
                if (err.code === "PROTOCOL_CONNECTION_LOST") {
                    //connection lost
                    this.startConnection(runAfter);
                } else {
                    runAfter();
                }
            } else {
                runAfter();
            }
        });
    }


    /**
     * query from db
     */
    query(sql, object, callback) {
        this.checkConnection((function () {
            this._mysql.query(sql, object, function (err, result, rows) {
                if (callback) {
                    if (err) {
                        err.query = sql;
                        err.data = object;
                    }
                    callback(err, result, rows);
                }
            });
        }).bind(this));
    }


    /**
     *
     * @param {String}      table
     * @param {Object}      object
     * @param {Function}    callback
     */
    insert(table, object, callback) {
        this.checkConnection((function () {
            let query = "INSERT INTO " + table + " (";
            let columns = Object.keys(object);

            query += columns.join(", ");
            query += ") VALUES (:";
            query += columns.join(", :");
            query += ");";

            this._mysql.query(query, object, function (err, result) {
                if (!err) {
                    if(callback) {
                        callback(false, result.insertId);
                    }
                } else {
                    err.data = object;
                    err.query = query;
                    if(callback) {
                        callback(err);
                    }
                }
            });
        }).bind(this));
    }

    /**
     * Runs multiple Inserts.
     * @param table
     * @param columns - array with the columns
     * @param values - object with the values
     * @param callback
     */
    multiInsert(table, columns, values, callback) {
        let query = "INSERT INTO " + table + " (" + columns.join(",") + ") VALUES ";
        let length = values.length;
        let lengthCol = columns.length;
        let queryValues = {};

        let colCopy = [];
        let y;

        for (y = 0; y < lengthCol; y++) {
            colCopy.push(":#id#_" + columns[y]);
        }

        let valueString = colCopy.join(",");

        for (let i = 0; i < length; i++) {
            let obj = values[i];
            for (y = 0; y < lengthCol; y++) {
                queryValues[i + "_" + columns[y]] = obj[columns[y]];
            }
            query += ("(" + valueString.replaceAll("#id#", i) + ")");
            if (length !== i + 1) {
                query += ",";
            }
        }

        this._mysql.query(query, queryValues, function (err) {
            if (!err) {
                callback(null);
            } else {
                err.query = query;
                callback(err);
            }
        });
    }

    /**
     * Checks if there is Dataset with the given Filter combinded by AND
     * For more dynamic checks use @func existCustom(table, filterString, filterArray)
     *
     * @param table
     * @param filter
     * @param callback
     */
    exist(table, filter, callback) {
        this.checkConnection((function () {
            let query = "SELECT ID FROM " + table + " WHERE ";

            let columns = Object.keys(filter);
            let filtersFormated = [];
            for (let i = 0; i < columns.length; i++) {
                filtersFormated.push(columns[i] + " = :" + columns[i]);
            }

            query += filtersFormated.join(" AND ");

            this._mysql.query(query, filter, function (err, result) {
                if (!err) {
                    if (result.length > 0) {
                        callback(false, true);
                    } else {
                        callback(false, false);
                    }
                } else {
                    err.query = query;
                    callback(err);
                }
            });
        }).bind(this));
    }

    /**
     * This Function checks if there is a Dataset by a custom Filterstring.
     *
     * @param table
     * @param filterString
     * @param filterArray
     * @param callback
     */
    existCustom(table, filterString, filterArray, callback) {
        this.checkConnection((function () {
            let query = "SELECT ID FROM " + table + " WHERE ";

            query += filterString;

            this._mysql.query(query, filterArray, function (err, result) {
                if (!err) {
                    if (result.length > 0) {
                        callback(false, true);
                    } else {
                        callback(false, false);
                    }
                } else {
                    err.query = query;
                    callback(err);
                }
            });
        }).bind(this));
    }

    /**
     * Checks if there is Dataset with the given Filter combinded by AND
     * For more dynamic checks use @func getTableCustom(table, filterString, filterArray)
     *
     * @param table
     * @param filter
     * @param callback
     * @param queryExtension - can be for example ORDER BY
     */
    getTable(table, filter, callback, queryExtension) {
        this.checkConnection((function () {
            let query = "SELECT * FROM " + table + " ";

            let columns = Object.keys(filter);
            let filtersFormated = [];
            if (columns.length > 0) {
                query += "WHERE ";
            }

            for (let i = 0; i < columns.length; i++) {
                filtersFormated.push(columns[i] + " = :" + columns[i]);
            }

            query += filtersFormated.join(" AND ");

            if (queryExtension) {
                query += " ";
                query += queryExtension;
            }

            this._mysql.query(query, filter, function (err, result, rows) {
                if (!err) {
                    callback(err, result, rows);
                } else {
                    err.query = query;
                    callback(err);
                }
            });
        }).bind(this));
    }

    /**
     * Updates a row/field in a table of the database
     * @param {String} table - Name of the Table.
     * @param {Object} fields - Object of the updated columns and their new values {column: value}
     * @param {Object} filter - Object with Columns and their expected value {column: value}
     * @param {function} [callback] - Callback function with params function(error).
     */
    update(table, fields, filter, callback) {
        this.checkConnection((function () {
            let query = "UPDATE " + table + " SET ";

            let fieldsFormated = [];
            let values = {};
            let i;

            let columns = Object.keys(fields);
            for (i = 0; i < columns.length; i++) {
                fieldsFormated.push(columns[i] + " = :v" + columns[i]);
                values["v" + columns[i]] = fields[columns[i]];
            }

            query += fieldsFormated.join(", ");

            query += " WHERE ";

            columns = Object.keys(filter);
            let filtersFormated = [];
            for (i = 0; i < columns.length; i++) {
                filtersFormated.push(columns[i] + " = :f" + columns[i]);
                values["f" + columns[i]] = filter[columns[i]];
            }

            query += filtersFormated.join(" AND ");

            this._mysql.query(query, values, function (err) {
                if (!err) {
                    if (callback) {
                        callback();
                    }
                } else {
                    err.query = query;
                    if (callback) {
                        callback(err);
                    }
                }
            });
        }).bind(this));
    }

    /**
     * Removes Rows from given Table.
     * @param table
     * @param {Object} filter - Object with Columns and their expected value {column: value}
     * @param {function} [callback] - Callback function with params function(error).
     */
    delete(table, filter, callback) {
        let query = "DELETE FROM " + table + " ";
        let values = {};
        let where = [];

        if (filter) {
            for (let key in filter) {
                if (filter.hasOwnProperty(key)) {
                    values[key] = filter[key];
                    where.push(key + "=:" + key);
                }
            }
            if (where.length > 0) {
                query += ("WHERE " + where.join(" AND "));
            }
        }

        this._mysql.query(query, values, function (err) {
            if (!err) {
                if (callback) {
                    callback();
                }
            } else {
                if (callback) {
                    err.query = query;
                    callback(err);
                }
            }
        });
    }
}

module.exports = Database;