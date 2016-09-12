/**
 * Created by C5217649 on 19.04.2016.
 */


var assert = require('chai').assert;
var url = "http://localhost:9999/api";
var request = require("request");



describe('/TerraTex', function () {
    describe('/Partners', function () {
        it('should return a valid result', function (done) {
            request.get({
                url: url + "/terratex/partners",
                method: "GET"
            }, function (error, response, body) {

                assert.isNull(error, "There shouldn't be an error.");

                assert(response.statusCode === 200, "Statuscode is not 200 (OK)");
                assert.isOk(JSON.parse(body), "It doesn't return a JSON.");

                // console.log("asd");
                var bodyContent = JSON.parse(body);
                assert.isOk(bodyContent.hasOwnProperty("status"), "Json contains no field status");
                assert.isOk(bodyContent.hasOwnProperty("success"), "Json contains no field success");
                assert.isOk(bodyContent.hasOwnProperty("error"), "Json contains no field error");
                assert.isOk(bodyContent.hasOwnProperty("result"), "Json contains no field result");
                assert.equal(bodyContent.success, true, "Success should be true.");
                assert.isNull(bodyContent.error, "Error in response should be null.");
                assert.isNotNull(bodyContent.result, "Result should not be null.");
                assert.isArray(bodyContent.result, "Result should be an Array.");
                assert(bodyContent.result.length > 0, "The Array in Result should not be empty.");
                var firstEntry = bodyContent.result[0];

                assert.isString(firstEntry.channel_name, "There should be a field 'channel_name' with type 'String'");
                assert.isString(firstEntry.display_name, "There should be a field 'display_name' with type 'String'");
                assert.isBoolean(firstEntry.lastState, "There should be a field 'lastState' with type 'Boolean'");
                assert.isNumber(firstEntry.lastFollowerCount, "There should be a field 'lastFollowerCount' with type 'Boolean'");
                assert.isNumber(firstEntry.lastViewsCount, "There should be a field 'lastViewsCount' with type 'Boolean'");
                assert.isBoolean(firstEntry.twitchPartnered, "There should be a field 'twitchPartnered' with type 'Boolean'");
                assert.isString(firstEntry.lastTitle, "There should be a field 'lastTitle' with type 'String'");
                assert.isString(firstEntry.lastGame, "There should be a field 'lastGame' with type 'String'");

                done();
            });
        });
    });
    describe('/BotChannels', function () {
        it('should return a valid result', function (done) {
            request.get({
                url: url + "/terratex/botchannels",
                method: "GET"
            }, function (error, response, body) {

                assert.isNull(error, "There shouldn't be an error.");

                assert(response.statusCode === 200, "Statuscode is not 200 (OK)");
                assert.isOk(JSON.parse(body), "It doesn't return a JSON.");

                // console.log("asd");
                var bodyContent = JSON.parse(body);
                assert.isOk(bodyContent.hasOwnProperty("status"), "Json contains no field status");
                assert.isOk(bodyContent.hasOwnProperty("success"), "Json contains no field success");
                assert.isOk(bodyContent.hasOwnProperty("error"), "Json contains no field error");
                assert.isOk(bodyContent.hasOwnProperty("result"), "Json contains no field result");
                assert.equal(bodyContent.success, true, "Success should be true.");
                assert.isNull(bodyContent.error, "Error in response should be null.");
                assert.isNotNull(bodyContent.result, "Result should not be null.");
                assert.isArray(bodyContent.result, "Result should be an Array.");
                assert(bodyContent.result.length > 0, "The Array in Result should not be empty.");
                var firstEntry = bodyContent.result[0];

                assert.isString(firstEntry.channel_name, "There should be a field 'channel_name' with type 'String'");
                assert.isString(firstEntry.display_name, "There should be a field 'display_name' with type 'String'");
                assert.isBoolean(firstEntry.lastState, "There should be a field 'lastState' with type 'Boolean'");
                assert.isNumber(firstEntry.lastFollowerCount, "There should be a field 'lastFollowerCount' with type 'Boolean'");
                assert.isNumber(firstEntry.lastViewsCount, "There should be a field 'lastViewsCount' with type 'Boolean'");
                assert.isBoolean(firstEntry.twitchPartnered, "There should be a field 'twitchPartnered' with type 'Boolean'");
                assert.isString(firstEntry.lastTitle, "There should be a field 'lastTitle' with type 'String'");
                assert.isString(firstEntry.lastGame, "There should be a field 'lastGame' with type 'String'");

                done();
            });
        });
    });
});