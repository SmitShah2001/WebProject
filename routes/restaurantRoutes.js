const express = require("express");
const router = express.Router();
const db = require("../config/database");
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const restaurant = require("../models/restaurant");

const app = express();

// Middleware to parse url-encoded bodies
app.use(express.urlencoded({ extended: true }));



// Middleware to validate query parameters
const validateQueryParams = [
    check("page").optional().isInt().toInt(),
    check("perPage").optional().isInt().toInt(),
    check("borough").optional().isString(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

// checking if the user is authenticated
const ensureLogin = (req, res, next) => {
    if (req.session.username) {
        next(); // User is authenticated, proceed to the next middleware/route handler
    } else {
        res.redirect('/api/users/login'); // User is not logged in, redirect to login page
    }
};

router.use("/api/restaurants/", (req, res, next) => {
    next();
});


//  /api/restaurants/allrestaurant
// router
//     .route("/allrestaurant")
//     .get(ensureLogin, async (req, res) => {
//         try {
//             const restaurants = await db.getAllTheRestaurants({});
//             res.status(200).render("AllRestaurant", { title: 'All Restaurant', restaurants: restaurants });
//         } catch (err) {
//             console.error("Error fetching Restaurants:", err);
//             res.status(500).json({ error: "Internal Server Error" });
//         }

// /api/restaurants/getRestaurantForm
router
    .route("/getRestaurantForm")
    .get(ensureLogin, (req, res) => {
        try {
            res.status(200).render("getRestaurant", { title: 'Get Restaurant By Page' });
        } catch (err) {
            console.error("Error fetching Restaurant form:", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

// /api/restaurants/addRestaurantForm
router
    .route("/addRestaurantForm")
    .get(ensureLogin, (req, res) => {
        try {
            res.status(200).render("addRestaurant", { title: 'Add Restaurant' });
        } catch (err) {
            console.error("Error fetching Add Restaurant form:", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

// /api/restaurants/updateRestaurantForm
router
    .route("/updateRestaurantForm")
    .get(ensureLogin, (req, res) => {
        try {
            res.status(200).render("updateRestaurant", { title: 'Update Restaurant' });
        } catch (err) {
            console.error("Error fetching Update Restaurant form:", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

// router.route("/update/:id")
//     .get(ensureLogin, async (req, res) => {


//         try {
//             const updateID = req.params.id;
//             console.log(updateID);
//             const result = await db.getRestaurantById(updateID);

//             if (!result || result.length === 0) {
//                 return res.status(404).json({ error: "Restaurant not found" });
//             } else {
//                 // Pass restaurant to updateRestaurant view
//                 console.log(result);
//                 res.render('updateRestaurant', {
//                     url: "/api/restaurants/" + result._id + "?_method=PUT",
//                     content: result
//                 });
//             }
//         } catch (error) {
//             // Handle any errors that occur during database operation
//             console.error("Error fetching restaurant:", error);
//             return res.status(500).json({ error: "Internal Server Error" });
//         }
//     });

// /api/restaurants/
router
    .route("/")
    .get(ensureLogin, validateQueryParams, async (req, res) => {
        try {

            const page = parseInt(req.query.page) || 1;
            const perPage = parseInt(req.query.perPage) || 10;
            const borough = req.query.borough || null;

            console.log(page);
            console.log(perPage);
            console.log(borough);

            const restaurants = await db.getAllRestaurants(page, perPage, borough);
            console.log(restaurants)
            res.status(200).render("restaurants", { restaurants: restaurants });
            // res.status(200).json(restaurants);

        } catch (err) {
            console.error("Error fetching Restaurants :", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    })
    .post(validateQueryParams, async (req, res) => {
        try {
            const newRestaurant = await db.addNewRestaurant(req.body);
            console.log(newRestaurant);

            if (newRestaurant.successForAdd) {
                // Restaurant added successfully
                return res.render('displayRestaurant', { title: 'Restaurant Added', successForAdd: true, newRestaurant: newRestaurant });
            } else {
                // Failed to add restaurant due to existing ID
                return res.render('displayRestaurant', { title: 'Restaurant Not Added', successForAdd: false, message: newRestaurant.message });
            }
            // res.status(201).json(newRestaurant);
        } catch (err) {
            console.error("Error  Adding  Restaurant:", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });


// /api/restaurants/searchByID/
router
    .route("/searchByID")
    .get(ensureLogin, validateQueryParams, async (req, res) => {
        try {
            res.status(200).render("searchByID", { title: 'Restaurant ID' });
        } catch (err) {
            console.error("Error fetching Search Restaurant Form:", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

// /api/restaurants/searchByName/
router
    .route("/searchByName")
    .get(ensureLogin, validateQueryParams, async (req, res) => {
        try {
            res.status(200).render('searchByName', { title: 'Restaurant Name' });
        } catch (err) {
            console.error("Error fetching Search Restaurant Form:", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

// /api/restaurants/searchByName/
router
    .route("/searchByName")
    .post(ensureLogin, async (req, res) => {
        try {
            const searchName = req.body.restaurantName; // Get the search query from the form

            // Call the search function from your db.js module
            const searchResults = await db.searchRestaurantsByName(searchName);

            // Convert Mongoose documents to plain JavaScript objects
            const parsedResults = searchResults.map(restaurant => restaurant.toObject());

            // Ensure parsedResults is an array
            const restaurants = Array.isArray(parsedResults) ? parsedResults : [parsedResults];

            // Render the searchString.hbs template with the sorted search results
            res.render('displayRestaurantName', { restaurants });
        } catch (error) {
            // Handle any errors and return an error response
            console.error(`Error searching for restaurants: ${error.message}`);
            res.status(500).json({ error: 'An error occurred while searching for restaurants' });
        }
        // });

    })

// /api/restaurants/id/
router
    .route("/:id")
    .get(async (req, res) => {
        try {

            const searchID = req.params.id;

            const result = await db.getRestaurantById(searchID);

            if (!result) {
                return res.status(404).json({ error: "Restaurant not found" });
            }
            // Convert Mongoose document to plain JavaScript object
            const restaurant = result.toObject();
            res.status(200).render("displayByID", { restaurant: restaurant });
        } catch (err) {
            console.error("Error fetching restaurant by ID:", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    })
    .put(auth, async (req, res) => {
        try {

            console.log(req.body);
            const result = await db.updateRestaurantById(req.body, req.params.id);
            if (result) {
                // Return the updated restaurant as JSON
                res.status(200).json(result);
            } else {
                res.status(404).json({ error: "Restaurant not found" });
            }

        } catch (err) {
            console.error("Error updating restaurant  here here by ID:", err);
            res.status(500).json({ error: "Internal Server Error" });
            // Return an error message with status code 500 (Internal Server Error)
        }
    })
    .delete(auth, async (req, res) => {
        try {
            const deletedRestaurant = await db.deleteRestaurantById(req.params.id);
            if (deletedRestaurant) {
                res.status(200).json({ message: "Restaurant deleted successfully" });
            } else {
                res.status(404).json({ error: "Restaurant not found" });
            }
        } catch (err) {
            console.error("Error deleting restaurant by ID:", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

module.exports = router;