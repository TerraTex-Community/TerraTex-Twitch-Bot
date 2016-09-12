"use strict";

class APIResult {
    constructor(res) {
        this._res = res;
        this._error = null;
        this._status = null;
        this._response = null;
    }

    /**
     * @param {String} error
     */
    setError(error) {
        this._error = error;
    }

    /**
     *
     * @param {Object} response
     */
    setResponse(response) {
        this._response = response;
    }

    /**
     *
     * @param {int} status
     */
    setStatus(status) {
        this._status = status;
    }

    send() {
        if (!this._status) {
            if (this._error) {
                this._status = 400;
            } else {
                this._status = 200;
            }
        }

        let success = (!this._error);

        let output = {
            status: this._status,
            success: success,
            error: this._error,
            result: this._response
        };

        this._res.status(this._status);
        this._res.set('Content-Type', 'text/json');
        this._res.json(output);
    }
}
global.APIResult = APIResult;