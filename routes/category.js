var express = require('express');
const checkEmptyLib = require('../lib/checkEmptyLib');
const authMiddleware = require('../middlewares/auth-middleware');
var router = express.Router();
const responseLib = require('../lib/responseLib');
const categoryModel = require('../models/category-model');

//create category
/** get all categories */
router.get('/', authMiddleware.isAuthorized, (req, res, next) => {
    let apiResponse;
    categoryModel.find((err, result) => {
        if(err) {
            apiResponse = responseLib.generate(true, "Server Error", 500, null);
            res.status(500).send(apiResponse);
        }
        else {
            apiResponse = responseLib.generate(false, "All Categories", 200, result);
            res.status(200).send(apiResponse);
        }
    })
})
router.post('/create', authMiddleware.isAuthorized, (req, res, next) => {
    let apiResponse;
    //validation
    if(checkEmptyLib.isEmpty(req.body.categoryTypeName)) {
        apiResponse = responseLib.generate(true, "category type name is not provided", 400, null);
        res.status(400).send(apiResponse);
        return;
    };

    let newCategory = new categoryModel({
        categoryTypeName: req.body.categoryTypeName,
        createdOn: new Date(),
        updatedOn: new Date(),
        ImgUrl: req.body.ImgUrl
    });
    newCategory.save((err, categoryResult) => {
        if(err) {
            apiResponse = responseLib.generate(true, "Server Error", 500, null);
            res.status(500).send(apiResponse);
        }
        else {
            apiResponse = responseLib.generate(false, "New Category Added", 200, categoryResult);
            res.status(200).send(apiResponse);
        }
    })
});

module.exports = router;