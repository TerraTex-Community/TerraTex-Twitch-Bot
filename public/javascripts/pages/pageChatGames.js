/**
 * Created by C5217649 on 26.02.2016.
 */

$(document).ready(function () {
    if (!window.chatGamesIncluded) {
        window.chatGamesIncluded = true;

        $("html").on('click', '#chatGames_saveRoulette', function () {
            var data = {
                active: $("#chatGames_rouletteEnabled").is(":checked"),
                option: $("#chatGames_rouletteRules").val(),
                points: $("#chatGames_roulette_points").val(),
                minPoints: $("#chatGames_roulette_min_points").val(),
                maxPoints: $("#chatGames_roulette_max_points").val()
            };
            g_socket.emit("chatGames_saveRoulette", data);
            return false;
        });
    }
});