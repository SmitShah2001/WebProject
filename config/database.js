/******************************************************************************
* ITE5315 – Project
* I declare that this assignment is my own work in accordance with Humber Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Group member Name: Smit Shah      Student IDs: N01580089  Date: 03/04/2024
                     Vivek Jethva                N01579474        
******************************************************************************/
const mongoose = require("mongoose");
const User = require("../models/user");
const Restaurant = require("../models/restaurant");


const db = {
    // Function to initialize the MongoDB connection
    initialize: async (url) => {
        try {
            // Connect to MongoDB using the provided connection string
            await mongoose.connect(url);
            // console.log('Connected to MongoDB');
            console.log("Successfully connected to the database");
        } catch (err) {
            // Log and throw an error if connection fails
            console.error(`Error connecting to MongoDB: ${err.message}`);
            throw err;
            // console.error("Error connecting to the database:", err);
        }
    },

    // Restaurant methods
    // Add Restaurant
    addNewRestaurant: async (data) => {
        try {
            // Check if restaurant with the given ID already exists
            const existingRestaurant = await Restaurant.findOne({ restaurant_id: data.restaurant_id }).exec();

            if (existingRestaurant) {
                return { success: false, successForAdd: false, message: 'Restaurant ID already exists in the database' };
            }

            // Function to generate random coordinates within a range
            const getRandomCoordinate = () => {
                const min = -90;
                const max = 90;
                const randomLatitude = Math.random() * (max - min) + min;
                const randomLongitude = Math.random() * (max - min) + min;
                return [randomLongitude, randomLatitude];
            };

            // Format the input data to match the desired structure
            const formattedData = {
                address: {
                    building: data.building,
                    coord: getRandomCoordinate(),
                    street: data.street,
                    zipcode: data.zipcode,
                },
                borough: data.borough,
                cuisine: data.cuisine,
                grades: [], // Initialize grades as an empty array
                name: data.name,
                restaurant_id: data.restaurant_id,
            };

            // Loop through the grade entries in the form
            for (let i = 0; i < data.grades.grade.length; i++) {
                // Check if both grade and score are present for the entry
                if (data.grades.grade[i] && data.grades.score[i]) {
                    formattedData.grades.push({
                        date: new Date().toISOString(), // Use current date for the example
                        grade: data.grades.grade[i],
                        score: data.grades.score[i],
                    });
                }
            }

            // Create a new instance of the Restaurant model with the formatted data
            const newRestaurant = new Restaurant(formattedData);

            // Save the new restaurant to the database
            const result = await newRestaurant.save();

            // Return the newly created restaurant
            return { success: true, successForAdd: true, message: 'Restaurant added successfully', result };
        } catch (error) {
            // Log and throw an error if adding new restaurant fails
            console.error(`Error adding new restaurant: ${error.message}`);
            throw { success: false, message: 'Error adding new restaurant' };
        }
    },


    // getAllTheRestaurants: async () => {
    //     try {
    //         const restaurants = await Restaurant.find().lean();
    //         console.log(restaurants); // Check if restaurants are fetched correctly
    //         return restaurants;
    //     } catch (error) {
    //         console.error("Error fetching restaurants:", error);
    //         throw error; // Rethrow the error to handle it in the calling function
    //     }
    // },

    getAllRestaurants: (page, perPage, borough) => {
        try {
            const query = borough ? { borough: borough } : {};
            const skip = (page - 1) * perPage;

            console.log(query);
            console.log(skip);

            return Restaurant.find(query)
                .sort({ 'restaurant_id': 1 })
                .skip(skip)
                .limit(perPage)
                .exec();

        } catch (error) {
            // Log and throw an error if getting all restaurants fails
            console.error(`Error getting all restaurants by page, perPage, and borough: ${error.message}`);
            throw error;
        }
    },

    getRestaurantById: (id) => {
        try {
            return Restaurant.findById(id);
            // return Restaurant.findOne({ "restaurant_id": id });
        }
        catch (error) {
            // Log and throw an error if getting a restaurant by ID fails
            console.error(`Error getting restaurant by ID: ${error.message}`);
            throw error;
        }
    },

    getRestaurantsById: (id) => {
        try {
            return Restaurant.findOne({ "restaurant_id": id });
        }
        catch (error) {
            // Log and throw an error if getting a restaurant by ID fails
            console.error(`Error getting restaurant by ID: ${error.message}`);
            throw error;
        }
    },

    updateRestaurantById: (data, id) => {
        try {
            const update = Restaurant.findByIdAndUpdate(id, data, { new: true }).exec();

            console.log(update);
            return update;
        }
        catch (error) {
            // Log and throw an error if updating a restaurant by ID fails
            console.error(`Error updating restaurant by ID: ${error.message}`);
            throw error;
        }
    },

    deleteRestaurantById: (id) => {
        try {
            return Restaurant.findByIdAndDelete(id).exec();
        } catch (error) {
            // Log and throw an error if deleting a restaurant by ID fails
            console.error(`Error deleting restaurant by ID: ${error.message}`);
            throw error;
        }
    },

    searchRestaurantsByName: async (restaurantName) => {
        try {
            // Use a regular expression to perform a case-insensitive partial string match
            const regex = new RegExp(restaurantName, 'i');

            // Use Mongoose to find restaurants that match the partial search query
            const searchResults = await Restaurant.find({ name: regex })
                .collation({ locale: 'en', strength: 2 }) // Enable case-insensitive sorting
                .sort({ name: 1 }); // Sort results by restaurant name in ascending order

            return searchResults;
        } catch (error) {
            console.error(`Error searching for restaurants by name: ${error.message}`);
            throw error; // Propagate the error to the calling function
        }
    },



    // User Login Register Methods

    addNewUser: async (data) => {
        try {
            const newUser = new User(data);
            return await newUser.save();
        } catch (error) {
            console.error("Error adding new user:", error);
            throw error;
        }
    },

    getUserByName: async (data) => {
        try {
            return await User.findOne({ "username": data }).exec();
        } catch (error) {
            console.error("Error getting user by name:", error);
            throw error;
        }
    },

    getAllUsers: async () => {
        try {
            return await User.find();
        } catch (error) {
            console.error("Error getting all users:", error);
            throw error;
        }
    },

    approveUser: async (data) => {
        try {
            return await User.findByIdAndUpdate(data.id, data, { new: true }).exec();
        } catch (error) {
            console.error("Error approving user:", error);
            throw error;
        }
    }

}

module.exports = db;