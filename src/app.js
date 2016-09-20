"use strict";

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var routes = require('./routes/index');
var routesTwitchAnswer = require('./routes/twitch_answer');
var routesQuotes = require('./routes/quotes');
var routesChangelogs = require('./routes/changelog');
var routesToplist = require('./routes/toplist');
var scDoku = require('./routes/script_docs');
var apiDoku = require('./routes/api_docs');
var apiRouter = require('./routes/api');
var cmdlistRoute = require('./routes/cmdlist');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

var hbs = require('hbs');
hbs.registerPartials(__dirname + '/views');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public','images','favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.use(require('node-sass-middleware')({
    src: __dirname + '/public',
    dest: __dirname + '/public',
    indentedSyntax: false,
    sourceMap: true,
    debug: (app.get('env') === 'development'),
    outputStyle: 'compressed',
    force: (app.get('env') === 'development')
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static(path.join(__dirname,'node_modules/socket.io-client/')));

var SessionStore = require('session-file-store')(session);
app.use(session({
    store: new SessionStore({ path: './tmp/sessions' }),
    resave: false,
    saveUninitialized: true,
    secret: 'TerraTexBotNode'
}));


app.use('/', routes);
app.use('/logout', routes);
app.use('/twitch', routesTwitchAnswer);

app.use('/toplist', routesToplist);

app.use('/quotes', routesQuotes);
app.use('/zitate', routesQuotes);

app.use('/script_docs', scDoku);
app.use('/api_docs', apiDoku);

app.use('/changelog', routesChangelogs);
app.use('/cmdlist', cmdlistRoute);

app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Site ' + req.originalUrl + ' Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res) {
        res.status(err.status || 500);
        res.render('error.hbs', {
            message: err.message,
            error: err
        });
    });
}


/*jshint camelcase: false */
global.g_app = app;

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.render('error.hbs', {
        message: err.message,
        error: {}
    });
});

let LoggerClass = require("./libs/Logger.class.js");
global.g_logger = {
    badword: new LoggerClass("badwords"),
    advertising: new LoggerClass("advertising"),
    bot: new LoggerClass("bot"),
    system: new LoggerClass("system"),
    api: new LoggerClass("api"),
    socket: new LoggerClass("socket")
};


require("./public/javascripts/system/array_shuffle.js");

let Config = require("./libs/Config.class.js");
/*jshint camelcase: false */
global.g_configs = {
    "twitch": new Config("twitch"),
    "database": new Config("database"),
    "badWord": new Config("badword"),
    "badWordEn": new Config("badword_en"),
    "advertising": new Config("anti_advertising")
};


global.g_helper = require("./libs/Helper.class.js");

let Database = require("./libs/Database.class.js");
global.g_database = new Database();

let TwitchAPI = require("twitch-api");
global.g_twitchAPI = new TwitchAPI({
    clientId: (g_app.get('env') === 'development') ? g_configs.twitch.api_local.clientID : g_configs.twitch.api_release.clientID,
    clientSecret: (g_app.get('env') === 'development') ? g_configs.twitch.api_local.secret : g_configs.twitch.api_release.secret,
    redirectUri: (g_app.get('env') === 'development') ? g_configs.twitch.api_local.redirect_url : g_configs.twitch.api_release.redirect_url,
    scopes: ["user_read", "channel_read", "channel_commercial", "channel_editor",
        "channel_subscriptions", "user_subscriptions", "channel_check_subscription"]
});

let TwitchBot = require("./libs/Bot.class.js");
let bot = new TwitchBot();
global.g_bot = bot;

global.terratex = {
    partnerRunner: new (require("./libs/API/runner/TerraTexPartnerRunner.class.js"))(),
    botChannelRunner: new (require("./libs/API/runner/TerraTexBotChannelRunner.class.js"))()
};

global.g_templateVars = {};
require("./libs/handlebars/loadHelper");

if (g_app.get('env') === 'development') {
    g_templateVars.url = "http://localhost:9999";
} else {
    g_templateVars.url = "https://twitch.terratex.eu";
}

bot.createOnlineChannelsOnStartUp();
let Backup = require("./libs/BackupRunner.js");
global.g_backup = new Backup();

require("./libs/API/result");

// Generate API Documentation and Link it
let fse = require("fs-extra");
var raml2html = require('raml2html');
var configWithDefaultTemplates = raml2html.getDefaultConfig();

raml2html.render("api_doc_raml/api.raml", configWithDefaultTemplates).then(function(result) {

    let fs = require("fs");
    fse.ensureDir("tmp", function() {
        fs.writeFile("tmp/api_docs.html", result);
    });
});

//ensure tmp paths
fse.ensureDir("tmp/channelLogs");
fse.ensureDir("tmp/sessions");

module.exports = app;
