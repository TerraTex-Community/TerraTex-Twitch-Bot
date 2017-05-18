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

    }
});
