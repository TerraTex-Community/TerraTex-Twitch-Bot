/**
 * Created by geramy on 10.01.2016.
 */
"use strict";

const express = require('express');
const router = express.Router();

router.use('/terratex', require("./API/terratex.js"));

/* GET home page. */
router.get('/*', function (req, res) {
    /**
     * @type APIResult
     */
    let response = new APIResult(res);
    response.setError("API - route does not exist.");
    response.send();
});

module.exports = router;
