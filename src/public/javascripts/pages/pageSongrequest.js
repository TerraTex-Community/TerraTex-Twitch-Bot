/**
 * Created by C5217649 on 16.05.2017.
 */
$(document).ready(() => {
    if (!window.script_songrequest) {
        window.script_songrequest = true;

        $("html").on("click", "#saveForm_songrequestSettings", () => {
            const settings = {
                enabled: $("#sr_enabled").is(":checked") ? 1 : 0,
                // autoPlay: $("#sr_autoplay").is(":checked") ? 1 : 0,
                minViewTime: $("#sr_minViewTime").val(),
                pointCosts: $("#sr_pointCosts").val(),
                showMessageInChat: $("#sr_showMessageInChat").is(":checked") ? 1 : 0
            };

            g_socket.emit("songrequest_save_settings", settings);
        });

        $("html").on("click", "#clear_request_playlist", () => {
            srClearPlaylist("request");
        });
        $("html").on("click", "#clear_default_playlist", () => {
            srClearPlaylist("default");
        });

        function srClearPlaylist(name) {
            g_socket.emit("songrequest_clear_playlist", {name: name});
        }

        $("html").on("click", "#sr_add_to_playlist", function() {
            $('#songrequestAddDialog').modal('show');
        });

        $("html").on("click", "#songrequestAddDialog .create", function() {
           const data = {
               playlistOrSong: $('#songrequestAddDialog input[name=songrequest_add_as]:checked').val(),
               link: $("#songrequestAddDialog #sr_link").val()
           };

           if (!data.link || data.link.length < 0) {
               alert("Bitte gebe eine korrekte URL oder ID ein!");
           } else {
               g_socket.emit("songrequest_add_to_playlist", data);
               $('#songrequestAddDialog').modal('hide');
           }
        });

        $("html").on("click", "#cardContent_DefaultPlaylist i[title='Löschen']", function () {
            srDeleteFromPlaylist($(this).attr("data-delete-ytid"), "default");
        });

        $("html").on("click", "#cardContent_NormalPlaylist i[title='Löschen']", function () {
            srDeleteFromPlaylist($(this).attr("data-delete-ytid"), "request");
        });

        function srDeleteFromPlaylist(songId, playlist) {
            g_socket.emit("songrequest_remove_from_playlist", {
                songId: songId,
                playlist: playlist
            });
        }

        $("html").on("click", "#cardContent_UserBlacklist i[title='Löschen']", function () {
            deleteFromBlacklist("user", $(this).attr("data-name"));
        });

        $("html").on("click", "#cardContent_SongBlacklist i[title='Löschen']", function () {
            deleteFromBlacklist("song", $(this).attr("data-id"));
        });

        function deleteFromBlacklist(songOrUser, nameOrId) {
            g_socket.emit("songrequest_remove_from_blacklist", {
                songOrUser: songOrUser,
                nameOrID: nameOrId
            });
        }

        $("html").on("click", "#cardContent_NormalPlaylist .blacklistRequester", function () {
            addToBlacklist("user", $(this).attr("data-name"));
        });
        $("html").on("click", "#cardContent_NormalPlaylist .blacklistSong", function () {
            addToBlacklist("song", $(this).attr("data-id"));
        });

        function addToBlacklist(songOrUser, nameOrId) {
            g_socket.emit("songrequest_add_to_blacklist", {
                songOrUser: songOrUser,
                nameOrID: nameOrId
            });
        }
    }
});
