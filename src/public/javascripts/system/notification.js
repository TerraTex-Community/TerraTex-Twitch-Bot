/**
 * Created by Colin on 03.01.2016.
 */
var counter = 0;

g_socket.on("notify", function (data) {
    /**
     * title
     * style
     * text
     */

    var template = '<div class="popover" role="tooltip"><div class="popover-arrow">';
    template += '</div><h3 class="popover-title"></h3><div class="popover-content"></div></div>';

    if (data.hasOwnProperty("style")) {
        template = '<div class="popover alert-';
        template += data.style;
        template += '" role="tooltip"><div class="popover-arrow"></div><h3 class="popover-title font-weight-bold alert-';
        template += data.style;
        template += '"></h3><div class="popover-content alert-';
        template += data.style;
        template += '"></div></div>';
    }

    counter++;
    $("#placeholderForNotifications").append("<div id='notification-" + counter + "'></div>");

    $("#notification-" + counter).popover({
        content: data.text,
        placement: "bottom",
        trigger: "manual",
        title: data.title,
        template: template
    });

    $("#notification-" + counter).popover('show');

    setTimeout(function () {
        $("#notification-" + counter).popover('hide');
        $("#notification-" + counter).remove();
    }, 2500);

});