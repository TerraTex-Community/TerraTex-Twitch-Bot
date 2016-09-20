/**
 * Created by geramy on 07.01.2016.
 */
"use strict";

class QuoteSystem {
    constructor(channel) {
        this._channel = channel;

        this._channel.command.registerNewCommand("quote", this.cmdQuote.bind(this), "user");

        this._settings = {};
        this.loadQuoteSettings();
    }

    /**
     * This Function sends a random Quote to the chat.
     */
    sendRandomQuoteToChat() {
        let query = "SELECT quoteToChannelID, name, quote, date FROM quotes WHERE channelID = :channelID ORDER BY rand() LIMIT 0,1";
        g_database.query(query, {channelID: this._channel._ID}, (function (err, result) {
            if (result.length > 0) {
                let name = result[0].name;
                let qID = result[0].quoteToChannelID;
                let quote = result[0].quote;

                let date = result[0].date;

                let output = this._channel.text.get("quoteSystem.quote_text", {
                    id: qID,
                    quote: quote,
                    user: name,
                    date: g_helper.time.dateToDateString(date)
                });
                this._channel._client.say(this._channel._channelName, output);
            }
        }).bind(this));
    }

    /**
     * This function is called by !quote and will call the spezified functions
     * add, remove, show or list
     *
     * @param {object} user    - User that has send the command
     * @param {string} message - complete message that was send
     */
    cmdQuote(user) {
        for (var _len = arguments.length, message = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            message[_key - 1] = arguments[_key];
        }

        let parts = message;
        if (parts.length === 1) {
            parts[1] = "random";
        }

        if (parts[1] === "add") {
            this.cmdQuoteAdd(user, parts);
        } else if (parts[1] === "remove") {
            this.cmdQuoteRemove(user, parts);
        } else if (parts[1] === "list") {
            this.cmdQuoteList();
        } else {
            this.cmdQuoteSend(user, parts);
        }
    }

    /**
     * Run by !quote [id=random]
     * Show a spezified or random Quote.
     * @param user
     * @param parts
     */
    cmdQuoteSend(user, parts) {
        //define Output to prevent multiple declarations
        let output = "";

        parts[1] = parseInt(parts[1]);
        if (!Number.isInteger(parts[1])) {
            parts[1] = "random";
        }
        if (parts[1] === "random") {
            this.sendRandomQuoteToChat();
        } else {
            let query = "SELECT quoteToChannelID, name, quote, date FROM quotes WHERE channelID = :channelID AND quoteToChannelID = :qID";
            g_database.query(query, {channelID: this._channel._ID, qID: parts[1]}, (function (err, result) {
                if (!err && result.length === 1) {
                    let name = result[0].name;
                    let qID = result[0].quoteToChannelID;
                    let quote = result[0].quote;

                    let date = new Date(result[0].date);
                    output = this._channel.text.get("quoteSystem.quote_text", {
                        id: qID,
                        quote: quote,
                        user: name,
                        date: g_helper.time.dateToDateString(date)
                    });
                    this._channel._client.say(this._channel._channelName, output);
                } else {
                    output = this._channel.text.get("quoteSystem.quote_not_existing", {
                        id: parts[1],
                        fromUser: user["display-name"] || user.username
                    });
                    this._channel._client.say(this._channel._channelName, output);
                }
            }).bind(this));
        }
    }

    /**
     * Run by !quote list
     * Shows a link to a page with a list of all quotes
     */
    cmdQuoteList() {
        let link = "http://twitch.terratex.eu/quotes?channel=";

        link += this._channel._channelName;
        this._channel._client.say(this._channel._channelName, link);
    }

    /**
     * Run by !quote remove [id]
     * Removes a quote by a spezified id
     * @param user  - user who send the command
     * @param parts - splited message
     */
    cmdQuoteRemove(user, parts) {
        //define Output to prevent multiple declarations
        let output = "";

        if (user["user-type"] === "mod" || user.username === this._channel._channelName) {
            if (parts[2]) {
                parts[2] = parseInt(parts[2]);
                if (Number.isInteger(parts[2])) {
                    let request = {
                        channelID: this._channel._ID,
                        quoteToChannelID: parts[2]
                    };

                    g_database.exist("quotes", request, (function (existErr, exist) {
                        if (exist) {
                            g_database.query(
                                "DELETE FROM quotes WHERE channelID = :channelID AND quoteToChannelID = :quoteToChannelID",
                                request,
                                (function (dErr) {
                                    if (!dErr) {
                                        output = this._channel.text.get("quoteSystem.quote_deleted", {
                                            id: parts[2],
                                            fromUser: user["display-name"] || user.username
                                        });
                                        this._channel._client.say(this._channel._channelName, output);
                                    }
                                }).bind(this));
                        } else {
                            output = this._channel.text.get("quoteSystem.quote_not_existing", {
                                id: parts[2],
                                fromUser: user["display-name"] || user.username
                            });
                            this._channel._client.say(this._channel._channelName, output);
                        }
                    }).bind(this));
                }
            } else {
                output = this._channel.text.get("quoteSystem.quote_remove_wrong_usage", {
                    fromUser: user["display-name"]
                });
                this._channel._client.say(this._channel._channelName, output);
            }
        }
    }


    /**
     * run by !quote add [username] [quote]
     * adds a new quote
     * @param user  - user who send the command
     * @param parts - splited message
     */
    cmdQuoteAdd(user, parts) {
        //define Output to prevent multiple declarations
        let output = "";

        if (user["user-type"] === "mod" || user.username === this._channel._channelName) {
            if (parts.length < 4) {
                output = this._channel.text.get("quoteSystem.quote_add_wrong_usage", {
                    fromUser: user["display-name"] || user.username
                });
                this._channel._client.say(this._channel._channelName, output);
            } else {
                parts.shift();
                parts.shift();
                let name = parts.shift();
                let requestQuery = "SELECT max(quoteToChannelID)+1 AS newID FROM quotes WHERE channelID = :channelID";

                g_database.query(requestQuery, {channelID: this._channel._ID}, (function (err, result) {
                    if (!err) {
                        let qID = 1;
                        if (result.length > 0) {
                            qID = result[0].newID;
                        }

                        if (qID === null) {
                            qID = 1;
                        }
                        let quote = parts.join(" ");
                        let save = {
                            channelID: this._channel._ID,
                            name: name,
                            quote: quote,
                            qID: qID
                        };
                        let query = "INSERT INTO quotes (channelID, quoteToChannelID, name, quote) VALUES (:channelID, :qID, :name, :quote)";
                        g_database.query(query, save, (function (dbErr) {
                            if (!dbErr) {
                                let date = new Date();

                                output = this._channel.text.get("quoteSystem.quote_add", {
                                    id: qID,
                                    quote: quote,
                                    user: name,
                                    date: g_helper.time.dateToDateString(date)
                                });
                                this._channel._client.say(this._channel._channelName, output);
                            }
                        }).bind(this));
                    }
                }).bind(this));
            }
        }
    }

    loadQuoteSettings() {
        let sql = "SELECT * FROM quotes_settings WHERE channelID = :ID;";
        g_database.query(sql, {"ID": this._channel._ID}, (function (err, result) {
            if (!err) {
                if (result.length === 0) {
                    g_database.insert("quotes_settings", {channelID: this._channel._ID}, (function () {
                        this.loadQuoteSettings();
                    }).bind(this));
                } else {
                    this._settings.quoteSettings = result[0];
                }
            }
        }).bind(this));
    }
}

module.exports = QuoteSystem;
