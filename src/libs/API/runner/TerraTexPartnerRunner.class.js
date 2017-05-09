/**
 * Created by C5217649 on 05.04.2016.
 */
"use strict";

class TerraTexPartnerRunner {
    constructor() {
        this._partner = [];

        setTimeout((this._actualize).bind(this), 60000);
    }

    _actualize() {
        let newPartners = [];
        g_database.getTable("terratex_partners", {}, (function (err, result) {
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
                            if (resultStream && !errStream) {
                                if (resultStream.stream) {
                                    update.lastViewerCount = resultStream.stream.viewers;
                                    update.lastState = true;
                                }
                                newPartners.push(update);
                                g_database.update("terratex_partners", update, {channel_name: result[i].channel_name});

                            } 
                            if (i === result.length - 1) {
                                this._partner = newPartners;
                                setTimeout((this._actualize).bind(this), 60000);
                            }
                        }).bind(this));
                    } else {
                        console.error("Error on TerraTexParterRunner.class.js on Line 47", errAPI);
                        if (i === result.length - 1) {
                            this._partner = newPartners;
                            setTimeout((this._actualize).bind(this), 60000);
                        }
                    }
                }).bind(this));
            }
        }).bind(this));
    }

    getPartner() {
        return this._partner;
    }
}
module.exports = TerraTexPartnerRunner;