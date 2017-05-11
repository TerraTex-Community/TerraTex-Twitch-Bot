/**
 * Created by C5217649 on 22.03.2016.
 */
let editor, LuaMode, jsonEditor;

$(document).ready(function () {
    if (!window.script_scriptedCommands) {
        window.script_scriptedCommands = true;

        loadEditor();
        loadJsonEditor();

        $("html").on("click", "#scriptedCommands_createCommand", function () {
            $('#scriptedCommandTemplateSelector').modal('show');
            loadEditor();
            loadJsonEditor();
        });

        $("html").on("click", "#scriptedCommandTemplateSelector .create", function () {
            $('#scriptedCommandEditor .save').hide();
            $('#scriptedCommandEditor .create').show();
            $("#scriptedCommandName").attr("disabled", false);

            $("#scriptedCommandDescription").val("");
            $("#scriptedCommandParameterDescription").val("");

            let template = $("#scriptedCommandTemplate").val();
            if (template === "0") {
                editor.setValue("");
                jsonEditor.set({});
                $('#scriptedCommandEditor').modal('show');
            } else {
                g_socket.emit("getScriptedCommandExample", {id: template});
            }

            $('#scriptedCommandTemplateSelector').modal('hide');
        });

        $("html").on("click", "#scriptedCommandEditor .create", function () {
            let data = {
                command: $("#scriptedCommandName").val(),
                code: editor.getValue(),
                restrictedTo: $("#scriptedCommandPermission").val(),
                save: JSON.stringify(jsonEditor.get()),
                description: $("#scriptedCommandDescription").val(),
                paramDescription: $("#scriptedCommandParameterDescription").val()
            };

            g_socket.emit("createScriptedCommand", data);
        });

        $("html").on("click", "#scriptedCommandEditor .save", function () {
            let data = {
                command: $("#scriptedCommandName").val(),
                code: editor.getValue(),
                restrictedTo: $("#scriptedCommandPermission").val(),
                save: JSON.stringify(jsonEditor.get()),
                description: $("#scriptedCommandDescription").val(),
                paramDescription: $("#scriptedCommandParameterDescription").val()
            };

            g_socket.emit("saveScriptedCommand", data);
        });

        $("html").on("click", "#scriptedCommands .scEdit", function () {
            g_socket.emit("getScriptedCommandCode", $(this).attr("data-cmd"));
        });

        $("html").on("click", "#scriptedCommands .scDelete", function () {
            let command = $(this).attr("data-cmd");
            g_socket.emit("deleteScriptedCommand", command);
        });

        g_socket.on("sendExample", function (data) {
            editor.setValue(data.content);
            $('#scriptedCommandEditor').modal('show');
        });

        g_socket.on("sendScriptedCommandCode", function (data) {
            $("#scriptedCommandName").val(data.command);
            $("#scriptedCommandDescription").val(data.description);
            $("#scriptedCommandParameterDescription").val(data.paramDescription);
            $("#scriptedCommandPermission option").attr("selected", false);

            $("#scriptedCommandPermission option[value='" + data.restrictedTo + "']").attr('selected',true);

            loadEditor();
            loadJsonEditor();

            $('#scriptedCommandEditor .save').show();
            $('#scriptedCommandEditor .create').hide();

            $("#scriptedCommandName").attr("disabled", true);

            let save = JSON.parse(data.save);
            if (save === null) {
                save = {};
            }
            editor.setValue(data.code);
            jsonEditor.set(save);
            $('#scriptedCommandEditor').modal('show');
        });

        $("html").on("click", "#showScriptedCommandLog", function() {
           g_socket.emit("getScriptedCommandLog", {});
        });

        $("html").on("click", "#clearScriptedCommandLog", function() {
            $("#scriptedCommandLog textarea").val("");
            g_socket.emit("clearScriptedCommandLog", {});
        });

        g_socket.on("recieveCommandLog", function(data) {
            $("#scriptedCommandLog").modal('show');
            $("#scriptedCommandLog textarea").val(data);
            setTimeout (function(){
                $("#scriptedCommandLog textarea").scrollTop($("#scriptedCommandLog textarea")[0].scrollHeight);
            }, 500);
        });


    }
});

function loadEditor() {
    editor = ace.edit("editor");
    LuaMode = ace.require("ace/mode/lua").Mode;
    editor.session.setMode(new LuaMode());
}

function loadJsonEditor() {
    if ($("#jsoneditor .jsoneditor").length === 0) {
        const container = document.getElementById("jsoneditor");
        const options = {
            modes: ["code", "tree"]
        };
        jsonEditor = new JSONEditor(container, options);
    }
}
