CREATE TABLE channel
(
    ID INT(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    channelName VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    connected TINYINT(1) DEFAULT '0' NOT NULL,
    partnered TINYINT(1) DEFAULT '0',
    customLoginData VARCHAR(255),
    beta INT(11) DEFAULT '0' NOT NULL,
    connectMessage INT(11) DEFAULT '1',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX channelName ON channel (channelName);
CREATE TABLE chat_notifications
(
    ID INT(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    channelID INT(11),
    followerAlert INT(11) DEFAULT '1',
    chatJoinAlert INT(11) DEFAULT '0',
    chatJoinTarget ENUM('CHAT', 'STREAMER') DEFAULT 'CHAT',
    CONSTRAINT chat_notifications_channel_ID_fk FOREIGN KEY (channelID) REFERENCES channel (ID) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX chat_notifications_channelID_uindex ON chat_notifications (channelID);
CREATE TABLE quotes
(
    ID INT(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    channelID INT(11),
    quoteToChannelID INT(11),
    name VARCHAR(255),
    quote TEXT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT quotes_channel_ID_fk FOREIGN KEY (channelID) REFERENCES channel (ID) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX quotes_channelID_quoteToChannelID_pk ON quotes (channelID, quoteToChannelID);
CREATE TABLE quotes_settings
(
    ID INT(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    channelID INT(11),
    enabled INT(11) DEFAULT '1',
    CONSTRAINT quotes_settings_channel_ID_fk FOREIGN KEY (channelID) REFERENCES channel (ID)
);
CREATE UNIQUE INDEX quotes_settings_channelID_uindex ON quotes_settings (channelID);
CREATE TABLE viewer
(
    ID INT(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    channelID INT(11),
    viewerName VARCHAR(255),
    points FLOAT(20,1) DEFAULT '0.0',
    viewTime INT(11) DEFAULT '0',
    chatMessages INT(11) DEFAULT '0',
    isBot INT(11) DEFAULT '0',
    level VARCHAR(255),
    CONSTRAINT viewer_channel_ID_fk FOREIGN KEY (channelID) REFERENCES channel (ID) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX viewer_channelID_viewerName_pk ON viewer (channelID, viewerName);
CREATE TABLE text_categories
(
    ID INT(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    name VARCHAR(255),
    description VARCHAR(255)
);
CREATE UNIQUE INDEX text_categories_name_uindex ON text_categories (name);
CREATE TABLE text_custom
(
    ID INT(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    channelID INT(11),
    catID INT(11),
    textKey VARCHAR(255),
    text TEXT,
    CONSTRAINT text_custom_channel_ID_fk FOREIGN KEY (channelID) REFERENCES channel (ID) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT text_custom_text_categories_ID_fk FOREIGN KEY (catID) REFERENCES text_categories (ID) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX text_custom_catID_textKey_channelID_uindex ON text_custom (catID, textKey, channelID);
CREATE INDEX text_custom_channel_ID_fk ON text_custom (channelID);
CREATE TABLE viewer_points_configs
(
    ID INT(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    channelID INT(11),
    pointsEnabled INT(11) DEFAULT '1',
    pointsPerMinute FLOAT DEFAULT '1',
    pointsPerMinuteInChat FLOAT DEFAULT '0.5',
    pointsEveryMinutes INT(11) DEFAULT '5',
    pointsEveryMinutesInChat INT(11) DEFAULT '5',
    pointsGiveOnlyMods INT(11) DEFAULT '1',
    CONSTRAINT viewer_configs_channel_ID_fk FOREIGN KEY (channelID) REFERENCES channel (ID)
);

CREATE UNIQUE INDEX viewer_configs_channelID_uindex ON viewer_points_configs (channelID);
CREATE TABLE viewer_ranks_configs
(
    ID INT(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    channelID INT(11),
    enabled INT(11) DEFAULT '1',
    defaultRank VARCHAR(255) DEFAULT 'Zuschauer',
    CONSTRAINT viewer_ranks_configs_channel_ID_fk FOREIGN KEY (channelID) REFERENCES channel (ID) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX viewer_ranks_configs_channelID_uindex ON viewer_ranks_configs (channelID);
CREATE TABLE viewer_ranks
(
    ID INT(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    channelID INT(11),
    levelHours INT(11),
    levelName VARCHAR(255),
    CONSTRAINT viewer_ranks_channel_ID_fk FOREIGN KEY (channelID) REFERENCES channel (ID) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX viewer_ranks_channelID_levelHours_uindex ON viewer_ranks (channelID, levelHours);
CREATE TABLE giveaway_tmp_data
(
    ID INT(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    channelID INT(11),
    users TEXT,
    configs TEXT,
    CONSTRAINT giveaway_tmp_data_channel_ID_fk FOREIGN KEY (channelID) REFERENCES channel (ID)
);
CREATE UNIQUE INDEX giveaway_tmp_data_channelID_uindex ON giveaway_tmp_data (channelID);
CREATE TABLE minigames
(
    ID INT(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    channelID INT(11) NOT NULL,
    roulette VARCHAR(255) DEFAULT '{"active":true,"option":1,"points":50}',
    CONSTRAINT minigames_channel_ID_fk FOREIGN KEY (channelID) REFERENCES channel (ID) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX minigames_channelID_uindex ON minigames (channelID);
CREATE TABLE chatfilter
(
    ID INT(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    channelID INT(11),
    badWords INT(11) DEFAULT '1',
    badWords_useDefaultList INT(11) DEFAULT '1',
    adDomains INT(11) DEFAULT '1',
    adExclude VARCHAR(255) DEFAULT '[]',
    adIps INT(11) DEFAULT '1',
    adPermitTime INT(11) DEFAULT '3',
    adBanTime INT(11) DEFAULT '10',
    adBanAfterTimes INT(11) DEFAULT '3',
    badWords_banTime INT(11) DEFAULT '10',
    badWords_banAfterTimes INT(11) DEFAULT '3',
    adResetCounterTime INT(11) DEFAULT '30',
    badWords_resetCounterTime INT(11) DEFAULT '30',
    badWords_useDefaultList_en INT(11) DEFAULT '0',
    CONSTRAINT chat_filter_channel_ID_fk FOREIGN KEY (channelID) REFERENCES channel (ID) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX chat_filter_channelID_uindex ON chatfilter (channelID);
CREATE TABLE chatfilter_custom_badwords
(
    ID INT(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    channelID INT(11),
    description TEXT,
    regex VARCHAR(255),
    CONSTRAINT chat_filter_custom_badwords_channel_ID_fk FOREIGN KEY (channelID) REFERENCES channel (ID) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX chat_filter_custom_badwords_channelID_pk ON chatfilter_custom_badwords (channelID);
CREATE TABLE cmds_scripted
(
    ID INT(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    channelID INT(11),
    command VARCHAR(255),
    restrictedTo ENUM('USER', 'MOD', 'STREAMER') DEFAULT 'USER',
    code LONGTEXT,
    save LONGTEXT,
    description LONGTEXT,
    paramDescription VARCHAR(255) DEFAULT '',
    CONSTRAINT cmds_scripted_channel_ID_fk FOREIGN KEY (channelID) REFERENCES channel (ID) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX cmds_scripted_channelID_command_pk ON cmds_scripted (channelID, command);
CREATE TABLE cmds_scripted_examples
(
    ID INT(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    description VARCHAR(255),
    file VARCHAR(255),
    startingVersion VARCHAR(255) DEFAULT '0.0.0'
);
CREATE UNIQUE INDEX cmds_scripted_examples_description_uindex ON cmds_scripted_examples (description);
CREATE TABLE timer
(
    id INT(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    channelID INT(11),
    description VARCHAR(255),
    sendRandom INT(11) DEFAULT '0',
    minutes INT(11) DEFAULT '5',
    messages LONGTEXT,
    afterMessages INT(11) DEFAULT '0',
    afterMessagesType INT(11) DEFAULT '0',
    onlyIfStreaming TINYINT(1) DEFAULT '1',
    CONSTRAINT timer_channel_ID_fk FOREIGN KEY (channelID) REFERENCES channel (ID) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX timer_channel_ID_fk ON timer (channelID);
CREATE TABLE terratex_partners
(
    ID INT(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    channel_name VARCHAR(255),
    display_name VARCHAR(255),
    lastState TINYINT(1) DEFAULT '0',
    lastFollowerCount INT(11) DEFAULT '0',
    lastViewerCount INT(11) DEFAULT '0',
    lastViewsCount INT(11) DEFAULT '0',
    twitchPartnered TINYINT(1) DEFAULT '0',
    lastTitle VARCHAR(255),
    lastGame VARCHAR(255)
);
CREATE UNIQUE INDEX terratex_partners_channel_name_uindex ON terratex_partners (channel_name);
CREATE TABLE cmds_aliases
(
    ID INT(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    channelID INT(11),
    command VARCHAR(255),
    aliasOf VARCHAR(255),
    CONSTRAINT cmds_aliases_channel_ID_fk FOREIGN KEY (channelID) REFERENCES channel (ID) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX cmds_aliases_channelID_index ON cmds_aliases (channelID);
CREATE TABLE terratex_bot_channels
(
    ID INT(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    channel_name VARCHAR(255),
    display_name VARCHAR(255),
    lastState INT(11) DEFAULT '0',
    lastFollowerCount INT(11) DEFAULT '0',
    lastViewerCount INT(11) DEFAULT '0',
    lastViewsCount INT(11) DEFAULT '0',
    twitchPartnered INT(11) DEFAULT '0',
    lastTitle TEXT,
    lastGame TEXT
);
CREATE TABLE stats_viewer
(
    ID INT(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    channelID INT(11),
    viewer INT(11),
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT stats_viewer_channel_ID_fk FOREIGN KEY (channelID) REFERENCES channel (ID) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX stats_viewer_channel_ID_fk ON stats_viewer (channelID);
CREATE TABLE stats_follows
(
    ID INT(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    channelID INT(11),
    value INT(11),
    diff INT(11) DEFAULT '0',
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT stats_follows_channel_ID_fk FOREIGN KEY (channelID) REFERENCES channel (ID) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX stats_follows_channel_ID_fk ON stats_follows (channelID);

INSERT INTO text_categories (name, description) VALUES ('pointSystem', 'Points-System');
INSERT INTO text_categories (name, description) VALUES ('notifications', 'Chat Notifications');
INSERT INTO text_categories (name, description) VALUES ('quoteSystem', 'Zitate / Quotesystem');
INSERT INTO text_categories (name, description) VALUES ('viewerSystem', 'Viewerbefehle');
INSERT INTO text_categories (name, description) VALUES ('rankSystem', 'Level System');
INSERT INTO text_categories (name, description) VALUES ('giveAway', 'GiveAways');
INSERT INTO text_categories (name, description) VALUES ('chatgames', 'ChatGames');
INSERT INTO text_categories (name, description) VALUES ('chatfilter', 'ChatFilter System');


ALTER TABLE `quotes_settings` DROP FOREIGN KEY `quotes_settings_channel_ID_fk`; ALTER TABLE `quotes_settings` ADD CONSTRAINT `quotes_settings_channel_ID_fk` FOREIGN KEY (`channelID`) REFERENCES `channel`(`ID`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `viewer_points_configs` DROP FOREIGN KEY `viewer_configs_channel_ID_fk`; ALTER TABLE `viewer_points_configs` ADD CONSTRAINT `viewer_configs_channel_ID_fk` FOREIGN KEY (`channelID`) REFERENCES `channel`(`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

DROP TABLE stats_follows;
DROP TABLE stats_viewer;