/**
 * Created by C5217649 on 22.03.2016.
 */

/**
 * List of commands that are existing
 * @type {Array.<String>}
 */
var timerCommandList = [];

$(document).ready(function () {
    if (!window.script_timer) {
        window.script_timer = true;

        var lastEditedId = false;

        $("html").on("click", ".timerSelectCommandToggle", function () {
            if (timerCommandList.length > 0) {
                timerAddCommandsToCommandListDropDown($(this).parent().find(".timerSelectCommandForInput"));
            } else {
                g_socket.emit("timerGetCommandList");
            }
        });

        g_socket.on("timerCommandList", function (data) {
            timerCommandList = data;
            timerAddCommandsToCommandListDropDown($(".timerSelectCommandForInput"));
        });

        $("html").on("click", "#createTimer", function () {
            toggleTimerSaveButton(false);
            $("#createEditTimer .entry").html("");
            $("#createEditTimer .switch").bootstrapSwitch('state', false, false);
            $("#timerdescription").val("");
            $("#executeEveryXMinutes").val("5");
            $("#messagesAfter").val("0");
            $("#messagesAftertype option").attr("selected", false);
            $("#onlyIfStreaming").bootstrapSwitch('state', true, true);

            $("#createEditTimer").modal("show");
        });

        $("html").on("click", ".timerSelectCommandForInput .dropdown-item", function () {
            let text = $(this).text();
            $(this).parent().parent().parent().find(".content").val(text);
        });

        $("html").on("click", "#timerAddMessage", function () {
            var content = $("#createEditTimer .template").html();
            content = content.replace("#content#", "").replace("#switch#", "switch").replace("#selected#", true);

            $("#createEditTimer .entry").append(content);
            $('#createEditTimer input.switch').bootstrapSwitch();
        });

        $("html").on("click", "#createEditTimer .delete", function () {
            $(this).parent().parent().remove();
        });

        $("html").on("click", "#createEditTimer .create", function () {
            var data = {
                timerDesc: $("#timerdescription").val(),
                timerTime: $("#executeEveryXMinutes").val(),
                timerOrder: $("#createEditTimer #order").is(":checked"),
                timerAfterMessages: $("#messagesAfter").val(),
                timerAfterMessagesType: $("#messagesAfterType").val(),
                onlyIfStreaming: $("#onlyIfStreaming").is(":checked"),
                messages: []
            };

            $("#createEditTimer .entry tr").each(function () {
                var messageData = {
                    message: $(this).find(".content").val(),
                    intern: $(this).find(".intern").is(":checked")
                };
                data.messages.push(messageData);
            });

            g_socket.emit("createNewTimer", data);

        });

        $("html").on("click", "#createEditTimer .save", function () {
            var data = {
                timerId: lastEditedId,
                timerDesc: $("#timerdescription").val(),
                timerTime: $("#executeEveryXMinutes").val(),
                timerOrder: $("#createEditTimer #order").is(":checked"),
                timerAfterMessages: $("#messagesAfter").val(),
                timerAfterMessagesType: $("#messagesAfterType").val(),
                onlyIfStreaming: $("#onlyIfStreaming").is(":checked"),
                messages: []
            };

            $("#createEditTimer .entry tr").each(function () {
                var messageData = {
                    message: $(this).find(".content").val(),
                    intern: $(this).find(".intern").is(":checked")
                };
                data.messages.push(messageData);
            });

            g_socket.emit("saveTimer", data);
        });

        $("html").on("click", ".tDelete", function () {
            let id = $(this).attr("data-timer-id");
            g_socket.emit("deleteTimer", id);
        });

        $("html").on("click", ".tEdit", function () {
            let id = $(this).attr("data-timer-id");
            g_socket.emit("editTimer", id);
        });

        g_socket.on("sendTimerData", function (data) {

            $("#timerdescription").val(data.description);
            $("#executeEveryXMinutes").val(data.minutes);

            $("#messagesAfter").val(data.afterMessages);
            $("#messagesAfterType option").attr("selected", false);

            $("#messagesAfterType option[value='" + data.afterMessagesType + "']").attr('selected',true);


            $("#onlyIfStreaming").bootstrapSwitch('state', data.onlyIfStreaming === 1, data.onlyIfStreaming === 1);
            $("#order").bootstrapSwitch('state', data.sendRandom === 1, data.sendRandom === 1);

            var messages = JSON.parse(data.messages);
            var length = messages.length;
            var i, place;

            $("#createEditTimer .entry").html("");

            var content = $("#createEditTimer .template").html();
            for (i = 0; i < length; i++) {

                place = content.replace("#content#", messages[i].message).replace("#switch#", "switch");

                if (messages[i].intern) {
                    place = place.replace('data-selected="#selected#"', "checked=\"true\"");
                }

                $("#createEditTimer .entry").append(place);
            }


            $('#createEditTimer input.switch').bootstrapSwitch();
            toggleTimerSaveButton(true);
            $("#createEditTimer").modal("show");

            lastEditedId = data.id;

        });
        /**
         *
         * @param {bool} state - true=Save | false=create
         */
        function toggleTimerSaveButton(state) {
            if (state) {
                $("#createEditTimer .save").show();
                $("#createEditTimer .create").hide();
            } else {
                $("#createEditTimer .save").hide();
                $("#createEditTimer .create").show();
            }
        }

        /**
         *
         * @param dropDown - jQuery Object
         */
        function timerAddCommandsToCommandListDropDown(dropDown) {
            var length = timerCommandList.length;
            var i;
            dropDown.html("");
            for (i = 0; i < length; i++) {
                dropDown.append('<a class="dropdown-item" href="#">' + timerCommandList[i] + '</a>');
            }
        }
    }
});
