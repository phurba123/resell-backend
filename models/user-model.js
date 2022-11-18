let mongoose = require('mongoose');
let schema = mongoose.Schema;

let userSchema = new schema({
    firstName: {
        type: String,
        default: 'anonymous'
    },
    lastName: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        required: 'Password is required'
    },
    email: {
        type: String,
        unique: true,
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
    contactNo: {
        type: Number,
    },
    address: {
        type: String,
        default: ''
    },
    profileImg: {
        type: String,
        default: 'https://ionicframework.com/docs/img/demos/avatar.svg'
    }
});

let userModel = mongoose.model('userModel', userSchema);
module.exports = userModel;