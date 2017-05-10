/**
 * Created by C5217649 on 22.03.2016.
 */

var followerChart = null;
var viewerChart = null;

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
            // else if (data.chart === "follower") {
            //     var labels = [];
            //     var sumFollows = [];
            //     var changeFollows = [];
            //
            //     for (var objectID in data.data) {
            //         if (data.data.hasOwnProperty(objectID)) {
            //             labels.push(new Date(data.data[objectID].time));
            //             sumFollows.push(data.data[objectID].value);
            //             changeFollows.push(data.data[objectID].diff);
            //         }
            //     }
            //
            //     followerChart.data.datasets[0].data = changeFollows;
            //     followerChart.data.datasets[1].data = sumFollows;
            //     followerChart.data.labels = labels;
            //
            //     followerChart.update();
            //
            // } else if (data.chart === "viewer") {
            //     var viewerLabels = [];
            //     var sumViewers = [];
            //
            //     for (var viewerObjectID in data.data) {
            //         if (data.data.hasOwnProperty(viewerObjectID)) {
            //             viewerLabels.push(new Date(data.data[viewerObjectID].time));
            //             sumViewers.push(data.data[viewerObjectID].viewer);
            //         }
            //     }
            //
            //     viewerChart.data.datasets[0].data = sumViewers;
            //
            //     viewerChart.data.labels = viewerLabels;
            //
            //     viewerChart.update();
            // }
        });

        // $("html").on("change", "#followerTimeRange", function () {
        //     g_socket.emit("getDashBoardData", {
        //         "chart": "follower",
        //         "timerange": $("#followerTimeRange").val()
        //     });
        // });
        //
        // $("html").on("change", "#viewerTimeRange", function () {
        //     g_socket.emit("getDashBoardData", {
        //         "chart": "viewer",
        //         "timerange": $("#viewerTimeRange").val()
        //     });
        // });

    }

    // var ctxV = $("#viewerChart").get(0).getContext("2d");
    // viewerChart = new Chart(ctxV, {
    //     type: 'line',
    //     data: {
    //         labels: [],
    //         datasets: [
    //             {
    //                 label: '# Viewers',
    //                 data: [],
    //                 yAxisID: "sum",
    //                 fill: false,
    //                 borderColor: "green"
    //             }
    //         ]
    //     },
    //     options: {
    //         responsive: true,
    //         maintainAspectRatio: false,
    //         scales: {
    //             yAxes: [
    //                 {
    //                     ticks: {
    //                         beginAtZero: true
    //                     },
    //                     position: "left",
    //                     id: "sum",
    //                     scaleLabel: {
    //                         labelString: "Viewer"
    //                     }
    //                 }
    //             ],
    //             xAxes: [{
    //                 type: "time",
    //                 time: {
    //                     displayFormats: {
    //                         'millisecond': 'SSS [ms]',
    //                         'second': 'hh:mm:ss',
    //                         'minute': 'hh:mm:ss',
    //                         'hour': 'MMM D, HH:mm',
    //                         'day': 'll',
    //                         'week': 'll',
    //                         'month': 'MMM YYYY',
    //                         'quarter': '[Q]Q - YYYY',
    //                         'year': 'YYYY'
    //                     }
    //                 }
    //             }]
    //         }
    //     }
    // });


    // var ctx = $("#followerChart").get(0).getContext("2d");
    // followerChart = new Chart(ctx, {
    //     type: 'line',
    //     data: {
    //         labels: [],
    //         datasets: [{
    //             label: '# Änderung Followers',
    //             data: [],
    //             yAxisID: "change",
    //             fill: false,
    //             borderColor: "red"
    //         }, {
    //             label: '# Summe Followers',
    //             data: [],
    //             yAxisID: "sum",
    //             fill: false,
    //             borderColor: "green"
    //         }]
    //     },
    //     options: {
    //         responsive: true,
    //         maintainAspectRatio: false,
    //         scales: {
    //             yAxes: [
    //                 {
    //                     ticks: {
    //                         beginAtZero: true
    //                     },
    //                     position: "left",
    //                     id: "sum",
    //                     scaleLabel: {
    //                         labelString: "Summe der Follows"
    //                     }
    //                 },
    //                 {
    //                     ticks: {
    //                         beginAtZero: false
    //                     },
    //                     id: "change",
    //                     position: "right",
    //                     scaleLabel: {
    //                         labelString: "Änderung der Follows"
    //                     }
    //                 }],
    //             xAxes: [{
    //                 type: "time",
    //                 time: {
    //                     displayFormats: {
    //                         'millisecond': 'SSS [ms]',
    //                         'second': 'hh:mm:ss',
    //                         'minute': 'hh:mm:ss',
    //                         'hour': 'MMM D, HH:mm',
    //                         'day': 'll',
    //                         'week': 'll',
    //                         'month': 'MMM YYYY',
    //                         'quarter': '[Q]Q - YYYY',
    //                         'year': 'YYYY'
    //                     }
    //                 }
    //             }]
    //         }
    //     }
    // });

    // g_socket.emit("getDashBoardData", {
    //     "chart": "follower",
    //     "timerange": $("#followerTimeRange").val()
    // });
    //
    // g_socket.emit("getDashBoardData", {
    //     "chart": "viewer",
    //     "timerange": $("#viewerTimeRange").val()
    // });

    g_socket.emit("getDashBoardData", {
        "chart": "channelData"
    });

});
