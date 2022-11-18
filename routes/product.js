var express = require('express');
var router = express.Router();
let checkEmptyLib = require('../lib/checkEmptyLib');
let responseLib = require('../lib/responseLib');
const authMiddleware = require('../middlewares/auth-middleware');

const productModel = require('../models/product-model');

/* GET all products, Temporarily without pagination */
router.get('/', function (req, res, next) {
    let apiResponse;
    productModel.find((err, results) => {
        if(err) {
            apiResponse = responseLib.generate(true, "Server Error", 500, null);
            res.status(500).send(apiResponse);
        }
        else {
            apiResponse = responseLib.generate(false, "All Products", 200, results);
            res.status(200).send(apiResponse)
        }
    })
});

/** Create Product */
router.post('/create', authMiddleware.isAuthorized, (req, res, next) => {
    let apiResponse;
    console.log('product create body : ', req.body);
    //input validation
    if (checkEmptyLib.isEmpty(req.body.title) || checkEmptyLib.isEmpty(req.body.categoryTypeId) || checkEmptyLib.isEmpty(req.body.categoryTypeName) || checkEmptyLib.isEmpty(req.body.featuredImgUrl) || checkEmptyLib.isEmpty(req.body.postedByUserId) || checkEmptyLib.isEmpty(req.body.postedByUserName)) {
        apiResponse = responseLib.generate(true, "One or more inputs are missing", 400, null);
        res.status(400).send(apiResponse);
        return;
    };

    // If validation is succeded then create product
    let newProduct = new productModel({
        title: req.body.title,
        description: req.body.description,
        categoryTypeId: req.body.categoryTypeId,
        categoryTypeName: req.body.categoryTypeName,
        price: req.body.price,
        location: req.body.location,
        featuredImgUrl: req.body.featuredImgUrl,
        imagesUrl: req.body.imagesUrl,
        createdOn: new Date(),
        updatedOn: new Date(),
        postedByUserId: req.body.postedByUserId,
        postedByUserName: req.body.postedByUserName
    });

    console.log('new product is : ', newProduct);
    newProduct.save((err, productDetail) => {
        if(err) {
            apiResponse = responseLib.generate(true,'Server Error', 500, null);
            res.status(500).send(apiResponse);
        }
        else {
            console.log('product detail: ', productDetail)
            apiResponse = responseLib.generate(false, "Product created", 200, productDetail);
            res.status(200).send(apiResponse);
        }
    })

})

module.exports = router;
