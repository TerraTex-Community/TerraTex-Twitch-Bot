/**
 * Created by geramy on 06.01.2016.
 */
$(document).ready(function(){
    $("#saveForm_quotes").click(function(){
        var data = {
            quoteStatus: $("#quoteStatus").is(":checked")
        };
        g_socket.emit("saveQuotesSettings", data);
    });

});
