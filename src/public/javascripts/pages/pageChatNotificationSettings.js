/**
 * Created by geramy on 06.01.2016.
 */
$(document).ready(function(){
    $("#saveForm_followerAlert").click(function(){
        const data = {
            active: $("#followerAlert").is(":checked"),
            text: $("#followerText").val()
        };
        g_socket.emit("saveFollowerAlert", data);
    });

    $("#saveForm_chatJoinAlert").click(function(){
        const data = {
            active: $("#chatJoinAlert").is(":checked"),
            text: $("#chatJoinMessage").val(),
            target: $("#chatJoinTarget").val()
        };
        g_socket.emit("saveChatJoinAlert", data);
    });
});
