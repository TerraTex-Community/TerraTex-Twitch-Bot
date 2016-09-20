/**
 * Created by C5217649 on 11.03.2016.
 */

$(document).ready(function () {
    if (!window.chatFilter) {
        window.chatFilter = true;

        $("html").on('click', '#saveBadWords', function() {
            var data = {
                badWords: $("#badWords").is(":checked") ? 1 : 0,
                badWords_useDefaultList: $("#badWords_useDefaultList").is(":checked") ? 1 : 0,
                badWords_useDefaultList_en: $("#badWords_useDefaultList_en").is(":checked") ? 1 : 0,
                badWords_banAfterTimes: $("#badWords_banAfterTimes").val(),
                badWords_banTime: $("#badWords_banTime").val(),
                badWords_resetCounterTime: $("#badWords_resetCounterTime").val()
            };
            g_socket.emit("onSaveChatFilterBadWordSettings", data);
        });


        $("html").on('click', '#saveAD', function() {
            var data = {
                adDomains: $("#adDomains").is(":checked") ? 1 : 0,
                adIps: $("#adIps").is(":checked") ? 1 : 0,
                adPermitTime: $("#adPermitTime").val(),
                adBanAfterTimes: $("#adBanAfterTimes").val(),
                adBanTime: $("#adBanTime").val(),
                adResetCounterTime: $("#adResetCounterTime").val()
            };
            g_socket.emit("onSaveChatFilterAdSettings", data);

        });


        // add and remove filter

        $("html").on('click', '#addBadWord', function() {
            var template = $("#chatfilter_badwords .template").html();

            var badWord = $('<div/>').text($("#add_badword").val()).html();
            var regex = $('<div/>').text($("#add_regex").val()).html();

            template = template.replace("#badword", badWord).replace("#regex", regex);

            $("#chatfilter_badwords .entry").prepend(template);

            $("#add_badword").val("");
            $("#add_regex").val("");
        });

        $("html").on('click', '#chatfilter_badwords .deleteRow', function() {
            $(this).parent().parent().remove();
        });

        $("html").on('click', '#addDomainIP', function() {
            var template = $("#chatfilter_adWhiteList .template").html();

            var domain = $('<div/>').text($("#add_domainip").val()).html();

            template = template.replace("#domain", domain);

            $("#chatfilter_adWhiteList .entry").prepend(template);

            $("#add_domainip").val("");
        });

        $("html").on('click', '#chatfilter_adWhiteList .deleteRow', function() {
            $(this).parent().parent().remove();
        });


        //load
        $("html").on('show.bs.modal','#chatfilter_badwords', function () {
            $("#chatfilter_badwords .entry").html("");
            g_socket.emit("getBadWords", {});
        });

        $("html").on('show.bs.modal','#chatfilter_adWhiteList', function () {
            $("#chatfilter_adWhiteList .entry").html("");
            g_socket.emit("getADWhiteList", {});
        });

        g_socket.on("sendBadWords", function(data) {
            var length = data.length;
            var i, template;
            for (i = 0; i < length; i++) {
                template = $("#chatfilter_badwords .template").html();

                template = template.replace("#badword", data[i].description).replace("#regex", data[i].regex);

                $("#chatfilter_badwords .entry").prepend(template);
            }
        });

        g_socket.on("sendADWhiteList", function(data) {
            var length = data.length;
            var i, template;
            for (i = 0; i < length; i++) {
                template = $("#chatfilter_adWhiteList .template").html();
                template = template.replace("#domain", data[i]);
                $("#chatfilter_adWhiteList .entry").prepend(template);
            }
        });


        //save
        $("html").on('click','#chatfilter_badwords .save', function() {
            var data = {
                badwords: []
            };

            var badword, regex;
            $("#chatfilter_badwords .entry tr").each(function(){
                badword = $(this).find(".badword").text();
                regex = $(this).find(".regex").text();
                data.badwords.push({description: badword, regex: regex});
            });

            g_socket.emit("saveBadWords", data);

            $('#chatfilter_badwords').modal('hide');
        });

        $("html").on('click','#chatfilter_adWhiteList .save', function() {
            var data = {
                domains: []
            };

            var domain;
            $("#chatfilter_adWhiteList .entry tr").each(function(){
                domain = $(this).find(".domain").text();
                data.domains.push(domain);
            });

            g_socket.emit("saveAdWhiteList", data);


            $('#chatfilter_adWhiteList').modal('hide');
        });
    }
});