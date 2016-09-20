/**
 * Created by Colin on 02.01.2016.
 */
$(document).ready(function(){
    $(".sameHeight").each(function(){
       SH_ChangeHeight($(this));
    });
    SH_changeMinHeightToFull();

    $(window).resize(function(){
        $(".sameHeight").each(function(){
            SH_ChangeHeight($(this));
        });
        SH_changeMinHeightToFull();
    });
});

function SH_ChangeHeight(object) {
    var selector = object.attr("data-same-height");
    var newHeight = $(selector).outerHeight();
    if (object.attr("data-substract-objects")) {
        var list = object.attr("data-substract-objects").split(",");
        var length = list.length;
        var i;

        for (i = 0; i < length; i++) {
            newHeight -= $(list[i]).outerHeight();
        }
    }
    object.height(newHeight);
}

function SH_changeMinHeightToFull() {
    var topHeight = $("#topNavigation").outerHeight();
    $("#navContainerLeft").css("min-height", "calc(100vh - " + topHeight + "px)");
    $("#staticBar").css("min-height", "calc(100vh - " + topHeight + "px)");
}