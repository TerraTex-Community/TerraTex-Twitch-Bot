/**
 * Created by C5217649 on 22.03.2016.
 */



$(document).ready(function () {
    if (!window.pageAlias) {
        window.pageAlias = true;

        $("html").on("click", "#aliasCreated", function() {
            const command = $("#aliasCommand").val();
            const aliasOf = $("#aliasOf").val();

            g_socket.emit("addAlias", {command: command, aliasOf: aliasOf});
        });


        $("html").on("click", ".aliasDelete", function() {
            const id = $(this).attr("data-cmd");

            g_socket.emit("removeAlias", {command: id});
        });

    }
});
