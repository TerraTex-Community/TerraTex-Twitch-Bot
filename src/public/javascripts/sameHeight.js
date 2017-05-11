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
    const selector = object.attr("data-same-height");
    let newHeight = $(selector).outerHeight();
    if (object.attr("data-substract-objects")) {
        const list = object.attr("data-substract-objects").split(",");
        const length = list.length;
        let i;

        for (i = 0; i < length; i++) {
            newHeight -= $(list[i]).outerHeight();
        }
    }
    object.height(newHeight);
}

function SH_changeMinHeightToFull() {
    const topHeight = $("#topNavigation").outerHeight();
    $("#navContainerLeft").css("min-height", "calc(100vh - " + topHeight + "px)");
    $("#staticBar").css("min-height", "calc(100vh - " + topHeight + "px)");
}
