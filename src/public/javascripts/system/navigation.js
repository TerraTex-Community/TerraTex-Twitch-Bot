/**
 * Created by Colin on 02.01.2016.
 */
$(document).ready(function () {

    const params = getQueryParams(document.location.search);
    if (params.hasOwnProperty("page")) {
        requestPage(params.page);
    }

    $("body").on("click", "a", function () {
        getPage($(this));
    });
});

function getPage(objective) {
    if (objective.attr("data-remove-active")) {
        $(objective.attr("data-remove-active")).removeClass("active");
    }

    if (objective.attr("data-load-page")) {
        const page = objective.attr("data-load-page");
        requestPage(page);
    }
}

function requestPage(page) {
    g_socket.emit("getPage", page);
}

g_socket.on("loadPage", function (data) {
    $("a#nav_" + data.page).addClass("active");
    $("#content").html(data.content);
    $('input.switch').bootstrapSwitch();

    $("body").attr("data-page", data.page);
    window.history.pushState({}, "TerraTex Twitch Bot :: " + data.page, "/?page=" + data.page);
});

function getQueryParams(qs) {
    qs = qs.split('+').join(' ');

    let params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (true) {
        tokens = re.exec(qs);
        if (!tokens) {
            break;
        }

        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
}

g_socket.on("reloadPage", () => {
    const modals = $(".modal");
    let params;
    const length = modals.length;


    if (length > 0) {

        let id = $(modals[length-1]).attr("id");
        let latest = null;
        let noShown = true;

        for (let i = 0; i < length; i++) {
            id = $(modals[i]).attr("id");

            if ($("#" + id).data('bs.modal')) {
                noShown= false;
                latest = id;
            }
        }

        if (noShown) {
            params = getQueryParams(document.location.search);
            if (params.hasOwnProperty("page")) {
                requestPage(params.page);
            }
        }

        $("#" + id).on('hidden.bs.modal', function () {
            if (latest === $(this).attr("id")) {
                params = getQueryParams(document.location.search);
                if (params.hasOwnProperty("page")) {
                    requestPage(params.page);
                }
                latest = false;
            }
        });

        for (let i = 0; i < length; i++) {

            id = $(modals[i]).attr("id");
            $("#" + id).modal('hide');
        }

    } else {
        params = getQueryParams(document.location.search);
        if (params.hasOwnProperty("page")) {
            requestPage(params.page);
        }
    }
});
