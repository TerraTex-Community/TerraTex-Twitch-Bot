/**
 * Created by C5217649 on 19.01.2016.
 */

$(document).ready(function(){
    $(".saveStrings").click(function(){
        var cat = $(this).attr("data-cat-name");
        var saveKeys = [];

        $(".string_" + cat).each(function(){
           saveKeys.push({
               stringKey: $(this).attr("data-string-key"),
               text: $(this).val()
           });
        });

        g_socket.emit("saveStrings", {cat: cat, strings: saveKeys});
    });
});