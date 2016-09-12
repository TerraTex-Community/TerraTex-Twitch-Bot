/**
 * Created by C5217649 on 20.01.2016.
 */

$(document).ready(function () {
    $("#saveForm_pointsSettings").click(function () {
        var data = {
            pointsEnabled: $("#pointsEnabled").is(":checked"),
            pointsPerMinute: $("#pointsPerMinute").val(),
            pointsPerMinuteInChat: $("#pointsPerMinutesInChat").val(),
            pointsEveryMinutes: $("#pointsEveryMinute").val(),
            pointsEveryMinutesInChat: $("#pointsEveryMinutesInChat").val(),
            pointsGiveOnlyMods: $("#onlyModsHaveGive").is(":checked")
        };
        g_socket.emit("savePointsSettings", data);
    });
});