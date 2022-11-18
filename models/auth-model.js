const mongoose = require('mongoose');
const schema = mongoose.Schema;

let authSchema = new schema(
    {
        userId: {
            type: String
        },

        authToken:
        {
            type: String
        },

        tokenSecret:
        {
            type: String
        },

        tokenGenerationTime:
        {
            type: Date,
            default: new Date()
        }
    }
);
let authModel = mongoose.model('authModel', authSchema);

module.exports = authModel;
