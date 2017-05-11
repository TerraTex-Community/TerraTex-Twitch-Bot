$(document).ready(function () {
    if (!window.pageDashboard) {
        window.pageDashboard = true;

        g_socket.on("recieveDashBoardData", function (data) {
            if (data.chart === "channelData") {
                $("#dashboardCountViewer").html(data.data.viewer);
                $("#dashboardSumChatMessages").html(data.data.sumChatMessages);
                $("#dashboardSumPoints").html(data.data.sumPoints);
                $("#dashboardSumViewTime").html(data.data.sumViewTime);
            }
        });
    }

    g_socket.emit("getDashBoardData", {
        "chart": "channelData"
    });
});
