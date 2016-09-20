/**
 * Created by C5217649 on 27.01.2016.
 */

$(document).ready(function () {
    if (!window.giveAwayIncluded) {

        window.giveAwayIncluded = true;
        $("html").on("click", "#startGiveAway", function () {
            var option = $("#removePointsOption").val();
            var points = $("#minPoints").val();

            g_socket.emit("startGiveAway", {
                option: option,
                points: points
            });
        });

        g_socket.on("newGiveAwayViewer", function (data) {
            $("#userListEntries").append(
                "<div class='userItem' style='color:" + data.color + "'>" + data["display-name"] + "</div>"
            );
        });

        g_socket.on("sendWinnerIsFollower", function(data){
            if (data.isFollower) {
                $(".winnerIsFollower").html("<span class='text-success'>" +
                    "<span class='fa fa-heart'></span> " +
                    " Follower" +
                    "</span>");
            } else {
                $(".winnerIsFollower").html("<span class='text-danger'>" +
                    "<span class='fa fa-times'></span> " +
                    " Follower" +
                    "</span>");
            }
        });

        /**
         * param data : list of all users
         */
        g_socket.on("generateNewSlideBar", function (data) {
            var userList = [];
            var userKey, output, user;

            if (Object.keys(data).length > 0) {
                for (userKey in data) {
                    if (data.hasOwnProperty(userKey)) {
                        user = data[userKey];
                        output = '<div class="card" data-user="' + user.username + '">';
                        output += '<img class="card-img"';
                        if (!user.logo) {
                            output += '      src="//static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_150x150.png">';
                        } else {
                            output += '      src="';
                            output += user.logo;
                            output += '">';
                        }
                        output += '    <div class="card-img-overlay">';
                        output += ('          <div class="usertitle">' + (user["display-name"] || user.username) + '</div>');
                        output += '    </div>';
                        output += '</div>';
                        userList.push(output);
                    }
                }

                var factor = Math.floor(680 / (userList.length)) + 1;
                var counter;
                var newList = [];

                for (counter = 0; counter < factor; counter++) {
                    newList = newList.concat(userList);
                }

                newList = newList.shuffle().shuffle().shuffle();


                $("#userRotateContainerForGiveAway").html("");
                $('#userRotateContainerForGiveAway').append(newList.join(''));
            }
        });

        $("html").on("click", "#rollGiveAway", function () {
            $("#rollGiveAway").hide();
            $("#winnerPlaceBoxedImage").html("");
            $("#winnerChat .bottomChatInner").html("");
            $(".inner .card.winner").removeClass("winner");
            $(".inner").animate({"left": ($(".inner").position().left - Math.rand(1500, 5000))}, Math.rand(8000, 15000), "easeOutQuint", function () {
                $("#rollGiveAway").show();
                var left = ($(".inner").position().left - 2.5) - ($(".winnerLine").position().left + 1.5) ;
                var elementWidth = $(".inner .card:first-child").outerWidth() + 5;
                var elementId = Math.floor((-left)/elementWidth+1);

                var winner = $(".inner .card:nth-child(" + elementId + ")").attr("data-user");
                $(".inner .card:nth-child(" + elementId + ")").addClass("winner");

                //send Winner to Server
                g_socket.emit("GiveAwayWinner", {winner: winner});

                //add Winner Image
                $("#winnerPlaceBoxedImage").html($(".inner .card:nth-child(" + elementId + ")").clone());
            });
        });

        g_socket.on("sendWinnerMessage", function(data){
            var messageFormated = "<small>";
            messageFormated += ("<span class='date'>" + data.time + "</span> ");
            messageFormated += ("<span style='color:" + data.color + "'>" + data.userName + "</span> ");
            messageFormated += ("<div class='message'>" + data.message + "</div><br/>");

            $("#winnerChat .bottomChatInner").append(messageFormated);

        });

        $("html").on("click", "#closeGiveAway", function(){
            g_socket.emit("closeGiveAway", {});
        });

        $("html").on("click", "#stopGiveAway", function(){
            g_socket.emit("stopGiveAway", {});
        });
    }
});