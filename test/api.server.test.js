/**
 * Created by C5217649 on 22.04.2016.
 */
var assert = require('chai').assert;
var url = "http://localhost:9999/api";
var request = require("request");

describe('- Server', function () {
    it('should be up and running', function (done) {
        request(url, function (error, response, body) {

            assert.isNull(error, "There shouldn't be an error.");

            assert(response.statusCode === 200 || response.statusCode === 400, "Statuscode is not 200 (OK) or 400 (BAD REQUEST)");
            assert.isOk(JSON.parse(body), "It doesn't return a JSON.");

            // console.log("asd");
            var bodyContent = JSON.parse(body);
            assert.isOk(bodyContent.hasOwnProperty("status"), "Json contains no field status");
            assert.isOk(bodyContent.hasOwnProperty("success"), "Json contains no field success");
            assert.isOk(bodyContent.hasOwnProperty("error"), "Json contains no field error");
            assert.isOk(bodyContent.hasOwnProperty("result"), "Json contains no field result");
            done();
        });
    });
});