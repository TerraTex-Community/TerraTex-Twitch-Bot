/**
 * Created by C5217649 on 18.01.2016.
 */
"use strict";
const path = require("path");

class TextHandler {
    constructor(channel, loadFromID, callBackAfterInit) {
        this._runAfterInit = callBackAfterInit;
        let id = channel;
        if (!loadFromID) {
            this._channel = channel;
            id = this._channel._ID;
            this._readOnly = false;
        } else {
            this._readOnly = true;
        }

        this._loadID = id;
        //read default texts
        let fs = require("fs");
        this._texts = JSON.parse(fs.readFileSync(path.resolve(__root, "configs","bot_text.json")));

        this._defaultDescriptions = JSON.parse(fs.readFileSync(path.resolve(__root, "configs","bot_default_params.json")));

        this._hogan = [];
        this._catNames = {};

        g_database.getTable("text_categories", {}, (function (err, result) {
            for (let i = 0; i < result.length; i++) {
                this._catNames[result[i].name] = result[i].description;
            }
            this._loadDefaultTextAndVars();
        }).bind(this));
    }

    /**
     * Load Custom Texts from Database
     * @private
     */
    _loadCustomTexts() {

        //read custom texts from Database and overwrite default texts
        let query = "SELECT cat.name, cat.description, t.textKey, t.text ";
        query += "FROM text_custom AS t ";
        query += "LEFT JOIN text_categories AS cat ON t.catID = cat.ID ";
        query += "WHERE t.channelID = :channelID";

        g_database.query(query, {channelID: this._loadID }, (function(err, texts){
            if (!err) {
                let length = texts.length;
                /**
                 * @type {Object}
                 */
                let textObject;
                for (let i = 0; i < length; i++) {
                    textObject = texts[i];
                    this._texts[textObject.name][textObject.textKey].text = textObject.text;
                }

                //end
                if(this._runAfterInit) {
                    this._runAfterInit();
                }

            }
        }).bind(this));
    }

    /**
     * load all texts additional as default and add description to default vars
     * @private
     */
    _loadDefaultTextAndVars() {

        /**
         * @type {Array}
         */
        let cat;

        //go though all categories
        for (let category in this._texts) {
            if (this._texts.hasOwnProperty(category)) {
                cat = [];
                //go though all texts in a categorie
                for (let textKey in this._texts[category]) {
                    if (this._texts[category].hasOwnProperty(textKey)) {
                        //Copy Text to Default
                        this._texts[category][textKey].default = this._texts[category][textKey].text;

                        //Go through all Vars to load default descriptions
                        let length = this._texts[category][textKey].vars.length;
                        for (let i = 0; i < length; i++) {
                            if (typeof this._texts[category][textKey].vars[i] === "string") {
                                this._texts[category][textKey].vars[i] = {
                                    "tag": this._texts[category][textKey].vars[i],
                                    "desc": this._defaultDescriptions[this._texts[category][textKey].vars[i]]
                                };
                            }
                        }

                        cat.push({
                            textKey: textKey,
                            item: this._texts[category][textKey]
                        });
                    }
                }
                this._hogan.push({
                    catKey: category,
                    catName: this._catNames[category],
                    texts: cat
                });
            }
        }

        // load custom texts after loading defaults and vars
        this._loadCustomTexts();
    }

    /**
     * Returns the complete Array of all Datafields of the Strings
     */
    getDefinitionArray() {
        return this._hogan;
    }

    /**
     * TextKey: categorie.textKey
     * @param key
     * @param {object} vars
     * @returns {*}
     */
    get(key, vars) {
        let textKey = key.split(".");
        let text = this._texts[textKey[0]][textKey[1]].text;

        if (vars) {
            for (let index in vars) {
                if (vars.hasOwnProperty(index)) {
                    text = text.replaceAll("#" + index + "#", vars[index] );
                }
            }
        }

        return text;
    }

    set(key, text){
        let textKey = key.split(".");
        this._texts[textKey[0]][textKey[1]].text = text;
        let query = "DELETE FROM text_custom WHERE textKey = :key AND channelID = :channelID AND catID IN (SELECT ID FROM text_categories WHERE name = :cat)";
        g_database.query(query,{
            key: textKey[1],
            channelID: this._channel._ID,
            cat: textKey[0]
        }, (function(){
            g_database.query("SELECT ID FROM text_categories WHERE name = :cat",{
                cat: textKey[0]
            }, (function(err, id ){
                id = id[0].ID;
                g_database.insert("text_custom", {
                    channelID: this._channel._ID,
                    catID: id,
                    textKey: textKey[1],
                    text: text
                });
            }).bind(this));
        }).bind(this));
    }
}

module.exports = TextHandler;
