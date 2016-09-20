/**
 * Created by Colin on 03.01.2016.
 */

$(document).ready(function () {
    if (!window.settingsIncluded) {
        window.settingsIncluded = true;

        $("html").on('click', '#settings_customLogin', function () {
            var data = {
                loginName: $("#custom_login_settings #customLogin_Name").val(),
                oauthPass: $("#custom_login_settings #customLogin_Password").val(),
                connectMessage: $('#connectMessage').is(':checked')
            };
            g_socket.emit("settings_customLogin", data);
        });

        $("html").on('click', '#settings_additionalOptions', function () {
            var data = {
                connectMessage: $('#connectMessage').is(':checked')
            };
            g_socket.emit("settings_additionalOptions", data);
        });


    }
});
