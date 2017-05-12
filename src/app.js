"use strict";

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');

const routes = require('./routes/index');
const routesTwitchAnswer = require('./routes/twitch_answer');
const routesQuotes = require('./routes/quotes');
const routesChangelogs = require('./routes/changelog');
const routesToplist = require('./routes/toplist');
const scDoku = require('./routes/script_docs');
const apiDoku = require('./routes/api_docs');
const apiRouter = require('./routes/api');
const cmdlistRoute = require('./routes/cmdlist');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

const hbs = require('hbs');
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

app.use(express.static(path.join(__dirname, '../node_modules/socket.io-client/dist')));

const SessionStore = require('session-file-store')(session);
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
app.use(function (req, res) {
    res.status(404);
    res.send('Site ' + req.originalUrl + ' Not Found');
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

//load process globals
require("./loadGlobals")();

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

//require("./libs/API/result");

// Generate API Documentation and Link it
const fse = require("fs-extra");
// const raml2html = require('raml2html');
// const configWithDefaultTemplates = raml2html.getDefaultConfig();
//
// raml2html.render("api_doc_raml/api.raml", configWithDefaultTemplates).then(function(result) {
//
//     let fs = require("fs");
//     fse.ensureDir("tmp", function() {
//         fs.writeFile("tmp/api_docs.html", result);
//     });
// });

//ensure tmp paths
fse.ensureDir("tmp/channelLogs");
fse.ensureDir("tmp/sessions");

module.exports = app;
