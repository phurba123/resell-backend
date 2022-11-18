//auth middleware
const mongoose = require('mongoose')
const response = require('../lib/responseLib')
const check = require('../lib/checkEmptyLib')
const tokenLib = require('../lib/tokenLib')

const authModel = require('../models/auth-model');

let isAuthorized = (req, res, next) => {
    let apiResponse;
    if (req.params.authToken || req.query.authToken || req.body.authToken || req.header('authToken')) {
        authModel.findOne({ 'authToken': req.params.authToken || req.query.authToken || req.body.authToken || req.header('authToken') })
            .exec((error, authDetails) => {
                if (error) {
                    apiResponse = response.generate(true, 'failed to authorize', 500, null);
                    res.status(500).send(apiResponse)
                }
                else if (check.isEmpty(authDetails)) {
                    apiResponse = response.generate(true, 'invalid or expired auth token', 500, null);
                    res.status(500).send(apiResponse)
                }
                else {
                    tokenLib.verifyClaim(authDetails.authToken, authDetails.tokenSecret, (err, decoded) => {
                        if (err) {
                            apiResponse = response.generate(true, 'failed to authorize', 500, null);
                            res.status(500).send(apiResponse);
                        }
                        else {
                            next();
                        }
                    })
                }
            })
    }
    else {
        apiResponse = response.generate(true, 'auth token is missing', 400, null);
        res.status(400).send(apiResponse)
    }
}

module.exports = {
    isAuthorized: isAuthorized
}