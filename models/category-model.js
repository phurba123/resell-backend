let mongoose = require('mongoose');
let schema = mongoose.Schema;

let categorySchema = new schema({
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
    ImgUrl: {
        type: String
    },
});

let categoryModel = mongoose.model('category', categorySchema);
module.exports = categoryModel;