const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
const db = require("../config/database");
const { check, validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require("passport");

require("dotenv").config();

// Import User Mongoose schemas
let User = require("../models/user");

const tokenKey = process.env.TOKEN_KEY;



// Middleware to validate query parameters
const validateQueryParams = [
  check("username").isString(),
  check("password").isString(),


  (req, res, next) => {
    console.log("Request Body:", req.body);
    const errors = validationResult(req);

    console.log(errors);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];


router.use("/api/users", (req, res, next) => {
  next();
});

// /api/users/register
router
  .route("/register")
  .get((req, res) => {
    try {
      res.status(200).render("register", { title: 'Register' });
    } catch (err) {
      console.error("Error fetching register form:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

// /api/users/register
router
  .route("/register")
  .post(validateQueryParams, async (req, res) => {
    try {

      // Initialize admin and approved to false
      const admin = false;
      const approved = false;

      // Async validation check of form elements
      await check("username", "UserName is required").notEmpty().run(req);
      await check("password", "Password is required").notEmpty().run(req);
      await check("confirm_password", "Confirm password is required")
        .notEmpty()
        .run(req);
      await check(
        "confirm_password",
        "Password and confirm password do not match"
      )
        .equals(req.body.password)
        .run(req);

      // // check if user already exist
      const existUser = await db.getUserByName(req.body.username);
      // // Validate if user exist in our database
      if (existUser) {
        // Route to login if user created
        return res.render("error", {
          title: "Dashboard",
          error: "Username already exists in the database. Please choose a different one.",
          existUser: existUser,
        });
        // return res.status(409).send("Username already exists in the database. Please choose a different one.");
      }

      // Get validation errors
      const errors = validationResult(req);

      if (errors.isEmpty()) {

        // Create new user from mongoose model
        // Assign attributes based on form data
        let newUser = new User({
          username: req.body.username,
          admin: admin,
          approved: approved,
        });


        bcrypt.genSalt(10, function (err, salt) {
          bcrypt.hash(req.body.password, salt, async function (err, hashed_password) {
            if (err) {
              console.log(err);
            } else {
              // Assign hashed password to newUser
              newUser.password = hashed_password;
              // Save new user to MongoDB
              // Save new user to MongoDB using custom function
              let result = await db.addNewUser(newUser);
              if (!result) {
                // Log error if failed
                res.send("Could not save user");
              } else {
                // Route to login if user created
                res.render("home", {
                  title: "User Registration",
                  success: "User registered successfully",
                  task: "Registration",
                  subtask: "registered",
                  result,
                });
                // res.redirect("/users/login");
              }
            }
          });
        });
      }

    } catch (err) {
      console.error("Error adding new user:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });



// /api/users/login
router
  .route("/login")
  .get((req, res) => {
    try {
      res.status(200).render("login", { title: 'Login' });
    } catch (err) {
      console.error("Error fetching login form:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

// /api/users/login
router
  .route("/login")
  .post(validateQueryParams, async (req, res) => {
    try {
      // Get user input
      const { username, password } = req.body;

      // Validate if user exist in our database
      const user = await db.getUserByName(username);

      // If the password matches, proceed to generate the token
      // Generate JWT
      const token = jwt.sign({ username: user.username }, tokenKey);

      // Set JWT as a cookie
      res.cookie('token', token, { httpOnly: true });

      // Store username in the session
      req.session.username = user.username;

      if (user && (await bcrypt.compare(password, user.password))) {

        if (user.approved) {

          // Create token
          const token = jwt.sign(
            { user_id: user._id, username },
            tokenKey,
            {
              expiresIn: "2h",
            }
          );
          console.log(token);

          // return res.redirect('/api/restaurant/allrestaurant');
          return res.render('Dashboard', { title: 'Dashboard Restaurant', dashboard: 'true', user });

          // user token
          // return res.status(200).json({ "token": token });
        }
        // return res.render('Dashboard', { title: 'Dashboard Restaurant', dashboard: 'true', user });
        return res.status(200).send("Waiting for Approval from Admin.");
      }

      res.status(400).send("Invalid Credentials");
    } catch (err) {
      console.log(err);
    }
  });

// /api/users/logout
router
  .route("/logout")
  .get((req, res) => {
    // Clear session
    req.session.destroy(err => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      // Clear cookies
      res.clearCookie('token');
      // Redirect to home page
      res.redirect("/");
    });
  });

module.exports = router;