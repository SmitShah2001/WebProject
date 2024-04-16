/******************************************************************************
* ITE5315 – Project
* I declare that this assignment is my own work in accordance with Humber Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Group member Name: Smit Shah      Student IDs: N01580089  Date: 03/04/2024
*                    Vivek Jethva                N01579474        
******************************************************************************/

// Import necessary modules
const express = require("express"); // Express.js framework
const bodyParser = require("body-parser"); // Middleware to parse incoming request bodies
const exphbs = require("express-handlebars"); // Templating engine for Express
const path = require("path"); // Module for working with file and directory paths
const cors = require("cors"); // Middleware for enabling Cross-Origin Resource Sharing (CORS)
const session = require("express-session"); // Middleware for managing sessions
const crypto = require('crypto'); // Module for cryptographic functionality
const db = require("./config/database"); // Database configuration
const passport = require("passport"); // Passport configuration
const userRoutes = require("./routes/userRoutes"); // Routes for user-related endpoints
const adminRoutes = require("./routes/adminRoutes"); // Routes for admin-related endpoints
const restaurantRoutes = require("./routes/restaurantRoutes"); // Routes for restaurant-related endpoints
const handlebars = require("handlebars"); // Handlebars templating engine
const { allowInsecurePrototypeAccess } = require("@handlebars/allow-prototype-access");
var methodOverride = require('method-override')

const app = express(); // Initialize Express application

// Middleware
app.use(bodyParser.urlencoded({ extended: true })); // Parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // Parse application/json
app.use(bodyParser.json({ type: "application/vnd.api+json" })); // Parse custom JSON types
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, "public"))); // Serve static files from 'public' directory
app.set("/", path.join(__dirname, "views"));
app.use(cors()); // Enable CORS for all requests
app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    handlebars: allowInsecurePrototypeAccess(handlebars),
})); // Configure the express-handlebars view engine with the '.hbs' file extension
app.set('view engine', 'hbs'); // Set 'hbs' as the default view engine for the application

// Passport middleware
app.use(passport.initialize());
// Initialize session
app.use(session({
    secret: "secret", // Secret used to sign the session ID cookie
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 86400000,
    }, // Session cookie settings
}));

// Passport config
require("./config/passport")(passport);

// Wildcard route to allow user to be used in templates
app.get("*", function (req, res, next) {
    res.locals.user = req.user || null;
    next();
});

// MongoDB connection URL
const dbUrl = process.env.DB_URL;

// Route to render home page
app.get('/', (req, res) => {
    res.render('home', { title: 'Home Page' }); // Render 'home' view with title 'Home Page'
});

// Initialize MongoDB connection
db.initialize(dbUrl)
    .then(() => {
        // Set up routes
        app.use("/api/users", userRoutes); // User routes
        app.use("/api/admin", adminRoutes); // Admin routes
        app.use("/api/restaurants", restaurantRoutes); // Restaurant routes

        // Start the server after successfully connecting to MongoDB
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.error(`Failed to connect to MongoDB: ${err}`);
    });
