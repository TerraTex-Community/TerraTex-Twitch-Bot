/**
 * Created by C5217649 on 05.04.2016.
 */
"use strict";

class TerraTexBotChannelRunner {
    constructor() {
        this._partner = [];

        this._actualize();
    }

    _actualize() {
        let newPartners = [];
        //remove Old Channels
        let removeOldEntriesQuery = "DELETE FROM terratex_bot_channels WHERE channel_name NOT IN ( ";
        removeOldEntriesQuery += "SELECT channelName FROM channel WHERE connected = '1' )";

        let addNewEntries = "INSERT INTO terratex_bot_channels (channel_name)(";
        addNewEntries += "      SELECT channelName FROM channel WHERE channelName NOT IN (";
        addNewEntries += "          SELECT channel_name FROM terratex_bot_channels AS tbc";
        addNewEntries += "      ) AND connected = '1'";
        addNewEntries += "  )";


        g_database.query(removeOldEntriesQuery, {}, (function () {
            g_database.query(addNewEntries, {}, (function () {
                g_database.getTable("terratex_bot_channels", {}, (function (err, result) {
                    for (let i = 0; i < result.length; i++) {
                        g_twitchAPI.getChannel(result[i].channel_name, (function (errAPI, resultAPI) {

                            if (!errAPI && resultAPI) {
                                let update = {
                                    display_name: resultAPI.display_name || result[i].channel_name,
                                    lastFollowerCount: resultAPI.followers,
                                    lastViewsCount: resultAPI.views,
                                    twitchPartnered: resultAPI.partner,
                                    lastTitle: resultAPI.status,
                                    lastGame: resultAPI.game,
                                    lastViewerCount: 0,
                                    lastState: false
                                };

                                g_twitchAPI.getChannelStream(result[i].channel_name, (function (errStream, resultStream) {
                                    if (!errStream && resultStream) {
                                        if (resultStream.stream) {
                                            update.lastViewerCount = resultStream.stream.viewers;
                                            update.lastState = true;
                                        }
                                        newPartners.push(update);
                                        g_database.update("terratex_bot_channels", update, {channel_name: result[i].channel_name});
                                    } else {
                                        if (errStream) {
                                            console.error("streamerror: ", errStream);
                                        }
                                    }
                                    if (i === result.length - 1) {
                                        this._partner = newPartners;
                                        setTimeout((this._actualize).bind(this), 60000);
                                    }
                                }).bind(this));
                            } else {
                                console.error("API Error: ", errAPI);
                                if (i === result.length - 1) {
                                    this._partner = newPartners;
                                    setTimeout((this._actualize).bind(this), 60000);
                                }
                            }
                        }).bind(this));
                    }
                }).bind(this));
            }).bind(this));
        }).bind(this));
    }

    getChannels() {
        return this._partner;
    }
}
module.exports = TerraTexBotChannelRunner;
