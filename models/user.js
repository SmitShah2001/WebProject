let mongoose = require("mongoose");

// User Schema
let userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        required: true
    },
    approved: {
        type: Boolean,
        required: true
    }
});

// Export model
let User = module.exports = mongoose.model("User", userSchema);