/**
 * Created by C5217649 on 27.01.2016.
 */
"use strict";

$(document).ready(function(){
    $("#saveForm_levelSettings").click(function(){
        var defaultLevel = $("#defaultLevel").val();
        var isEnabled = $("#levelEnabled").is(":checked");

        g_socket.emit("saveLevelSettings",{
            enabled: isEnabled,
            defaultLevel: defaultLevel
        });
    });

    $("#addLevel").click(function(){
        var newHours = $("#addLevel_hours").val();

        g_socket.emit("addNewLevel",{
            hours: newHours
        });
    });

    g_socket.on("rerenderLevelTable", function(data){
        $("#drawLevels").html(data.levelTemplate);
    });

    $("html").on("click", ".deleteLevel", function(){
        if (confirm("Wollen Sie das Level wirklich löschen?")) {
            var id = $(this).attr("data-level");

            g_socket.emit("removeLevel",{
                id: id
            });
        }

    });

    $("#saveLevelNames").click(function(){
        var levelData = [];
        $("#drawLevels .levelName").each(function(){
            levelData.push({id: $(this).attr("data-level"), name: $(this).val()});
        });
        g_socket.emit("saveLevelNames",{
            levels: levelData
        });
    });
});