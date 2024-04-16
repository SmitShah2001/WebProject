/******************************************************************************
* ITE5315 – Project
* I declare that this assignment is my own work in accordance with Humber Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Group member Name: Smit Shah      Student IDs: N01580089  Date: 03/04/2024
                     Vivek Jethva                N01579474        
******************************************************************************/
let mongoose = require("mongoose");


let restaurantSchema = mongoose.Schema({
    address: {
        building: {
            type: String,
            required: true
        },
        coord: {
            type: [Number],
            required: true
        },
        street: {
            type: String,
            required: true
        },
        zipcode: {
            type: String,
            required: true
        }
    },
    borough: {
        type: String,
        required: true
    },
    cuisine: {
        type: String,
        required: true
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
    ],
    name: {
        type: String,
        required: true
    },
    restaurant_id: {
        type: String,
        required: true
    }
});


let Restaurants = module.exports = mongoose.model("Restaurant", restaurantSchema);