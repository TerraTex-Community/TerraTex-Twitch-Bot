module.exports = () => {
    global.__root = __dirname;

    require("./public/javascripts/system/array_shuffle.js");

    const Config = require("./libs/Config.class.js");
    /*jshint camelcase: false */
    global.g_configs = {
        "twitch": new Config("twitch"),
        "database": new Config("database"),
        "badWord": new Config("badword"),
        "badWordEn": new Config("badword_en"),
        "advertising": new Config("anti_advertising"),
        "youtube": new Config("youtube")
    };


    global.g_helper = require("./libs/Helper.class.js");

    const Database = require("./libs/Database.class.js");
    global.g_database = new Database();
};
