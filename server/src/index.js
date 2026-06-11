```javascript
/**
 * @file server/src/index.js
 * @description Main entry point for the Recipe & Meal Planner backend server.
 * This file sets up the Express application, connects to the database,
 * configures middleware, defines API routes for recipe search,
 * favorite recipes, and meal planning, and starts the server.
 */

require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const cors = require('cors');
const axios = require('axios'); // For making HTTP requests to external APIs
const mongoose = require('mongoose'); // Mongoose for MongoDB object modeling

const connectDB = require('./utils/db'); // Database connection utility

// Initialize the Express application
const app