create table songrequest_settings
(
	ID int auto_increment
		primary key,
	channelID int null,
	enabled int(1) default '0' null,
	autoPlay int(1) default '1' null,
	minViewTime int default '0' null,
	pointCosts int default '0' null,
	showMessageInChat int(1) default '1' null,
	constraint songrequest_settings_channelID_uindex
		unique (channelID),
	constraint songrequest_settings_channel_ID_fk
		foreign key (channelID) references twitch_bot.channel (ID)
			on update cascade on delete cascade
);

create table songrequest_playlists
(
	ID int auto_increment
		primary key,
	channelID int null,
	youtubeID varchar(32) null,
	title varchar(255) null,
	requestedBy varchar(255) null,
	autoplayPlaylist int default '0' null,
	requestedAt timestamp default current_timestamp() not null,
	constraint songrequest_playlists_channel_ID_fk
		foreign key (channelID) references twitch_bot.channel (ID)
			on update cascade on delete cascade
);

create index songrequest_playlists_channel_ID_fk
	on songrequest_playlists (channelID);

create table songrequest_blacklist
(
	ID int auto_increment
		primary key,
	channelID int null,
	nameOrID varchar(255) null,
	isSong int default '0' null,
	createdAt timestamp default current_timestamp() not null,
	constraint songrequestBlacklist_channel_ID_fk
		foreign key (channelID) references twitch_bot.channel (ID)
			on update cascade on delete cascade
);

create index songrequestBlacklist_channel_ID_fk
	on songrequest_blacklist (channelID);

ALTER TABLE songrequest_blacklist ADD title VARCHAR(255) NULL;
ALTER TABLE songrequest_playlists ADD played INT DEFAULT 0 NULL;