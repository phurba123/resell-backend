let mongoose = require('mongoose');
let schema = mongoose.Schema;

let productSchema = new schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    categoryTypeId: {
        type: String,
        required: 'Category Id is required'
    },
    categoryTypeName: {
        type: String,
        required: true
    },

    createdOn: {
        type: Date,
        default: new Date()
    },
    updatedOn: {
        type: Date,
        default: new Date()
    },
    price: {
        type: Number,
        default: 0
    },
    location: {
        type: String,
        default: ''
    },
    featuredImgUrl: {
        type: String,
        default: '',
        required: true
    },
    imagesUrl: [
        {
            url: {
                type: String
            }
        }
    ],
    postedByUserId: {
        type: String,
        required: true
    },
    postedByUserName: {
        type: String,
        required: true
    }
});

let productModel = mongoose.model('Product', productSchema);
module.exports = productModel;