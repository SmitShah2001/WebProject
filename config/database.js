const mongoose = require("mongoose");


const db = {
    initialize: async (url) => {
        try {
            await mongoose.connect(url);
            console.log("Successfully connected to the database");
        } catch (err) {
            console.error("Error connecting to the database:", err);
        }
    },
}

module.exports = db;