let mongoose = require("mongoose");


let restaurantSchema = mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    address: {
        building: {
            type: String,
            required: true
        },
        coord: {
            type: [{
                type: Number,
                required: true
            }],
            index: '2dsphere',
            required: true
        },
        street: {
            type: String,
            required: true
        },
        zipcode: {
            type: String,
            required: true
        },
        borough: {
            type: String,
            required: true
        },
        cuisine: {
            type: String,
            required: true
        }
    },
    grades: [
        {
            date: {
                type: Date,
                required: true
            },
            grade: {
                type: String,
                required: true
            },
            score: {
                type: Number,
                required: true
            }
        }
    ]
});


let Restaurant = module.exports = mongoose.model("Restaurant", restaurantSchema);