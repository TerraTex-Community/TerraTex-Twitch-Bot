/**
 * Created by Colin on 03.01.2016.
 */
"use strict";
const srHelper = require("./../../SongRequest.helper");

class SongRequest {
    static loadPageSockets(clientSocket) {
        clientSocket.on("songrequest_save_settings", function (data) {
            let channelID = clientSocket.handshake.session.user.id;

            g_database.update("songrequest_settings", data, {channelID: channelID}, err => {
                 if (err) {
                     clientSocket.emit("notify", {
                         style: "danger",
                         title: "Fehler beim speichern",
                         text: "Die neuen Einstellungen konnten nicht gespeichert werden."
                     });
                 } else {
                     if (g_bot._channelConnectors.hasOwnProperty(clientSocket.handshake.session.user.name)) {
                         let channel = g_bot._channelConnectors[clientSocket.handshake.session.user.name];
                         channel.songrequest.refreshSettings();
                     }

                     clientSocket.emit("notify", {
                         style: "success",
                         title: "Neue Einstellungen gespeichert",
                         text: "Die Einstellungen zum Songrequest wurden gespeichert."
                     });
                 }
            });
        });

        clientSocket.on("songrequest_clear_playlist", function (data) {
            let channelID = clientSocket.handshake.session.user.id;

            srHelper.clearPlayList(channelID, data.name, err => {
                if (err) {
                    clientSocket.emit("notify", {
                        style: "danger",
                        title: "Fehler",
                        text: "Beim leeren der Playlist ist ein Fehler aufgetreten"
                    });
                } else {
                    clientSocket.emit("notify", {
                        style: "success",
                        title: "Playlist leeren",
                        text: "Die Playlist wurde erfolgreich gelöscht."
                    });


                    clientSocket.emit("reloadPage", {});
                }
            });
        });

        clientSocket.on("songrequest_add_to_playlist", function (data) {
            let channelID = clientSocket.handshake.session.user.id;
            let channelName = clientSocket.handshake.session.user.username;
            if (data.playlistOrSong === "playlist") {
                srHelper.addPlaylistToPlaylist(channelID, channelName, data.link, "default", (err, added, of) => {
                    if (err) {
                        clientSocket.emit("notify", {
                            style: "danger",
                            title: "Fehler",
                            text: "Die Playlist konnte nicht zur Playlist hinzugefügt werden"
                        });
                    } else {
                        clientSocket.emit("notify", {
                            style: "success",
                            title: "Zur Playlist hinzufügen",
                            text: "Es wurden " + added + " von " + of + " Songs zur default Playlist hinzugefügt."
                        });
                    }
                    clientSocket.emit("reloadPage", {});
                });
            } else {
                srHelper.addSongToPlayList(channelID, channelName, data.link, "default", (err, data) => {
                    if (err) {
                        clientSocket.emit("notify", {
                            style: "danger",
                            title: "Fehler",
                            text: "Der Song konnte nicht zur Playlist hinzugefügt werden"
                        });
                    } else {
                        clientSocket.emit("notify", {
                            style: "success",
                            title: "Zur Playlist hinzufügen",
                            text: "Der Song " + data.title + " wurde zur default Playlist hinzugefügt."
                        });
                    }
                    clientSocket.emit("reloadPage", {});
                });
            }
        });
    }

    static sendPage(clientSocket, template) {
        if (clientSocket.handshake.session.user) {
            let channelID = clientSocket.handshake.session.user.id;

            g_database.getTable("songrequest_settings", {channelID: channelID}, function(dberror, settings){
                g_database.getTable("songrequest_playlists", {channelID: channelID}, function(plerror, playlistEntries) {
                    g_database.getTable("songrequest_blacklist", {channelID: channelID}, function(blerror, blacklistEntries) {
                        clientSocket.emit("loadPage", {content: template({
                            settings: settings[0],
                            playlists: playlistEntries,
                            blacklists: blacklistEntries
                        }), page: "songrequest"});
                    });
                });
            });
        }
    }
}

module.exports = SongRequest;
