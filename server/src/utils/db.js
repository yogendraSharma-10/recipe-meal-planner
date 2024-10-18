const mongoose = require('mongoose');

/**
 * Establishes a connection to the MongoDB database for the Recipe & Meal Planner service.
 * The MongoDB connection URI is retrieved from environment variables.
 *
 * In a microservice architecture, this service might connect to its own dedicated database
 * or a specific database within a shared MongoDB instance (e.g., `mongodb://localhost:27017/recipe-planner-db`).
 * User authentication and profile data might be managed by a separate 'Auth' or 'User' service,
 * potentially in a different database, with this service referencing user IDs.
 *
 * @returns {Promise<void>} A promise that resolves when the connection is successfully established,
 *                          or rejects if an error occurs during connection.
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('CRITICAL ERROR: MONGODB_URI environment variable is not set.');
    console.error('Please ensure .env file is configured or environment variables are loaded.');
    // Exit the process as the application cannot function without a database connection.
    process.exit(1);
  }

  try {
    // Mongoose 6+ automatically handles useNewUrlParser, useUnifiedTopology, useCreateIndex, useFindAndModify
    // These options are deprecated and no longer needed.
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000,        // Close sockets after 45 seconds of inactivity
      family: 4,                     // Use IPv4, skip trying IPv6
    });
    console.log('MongoDB connected successfully!');
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Exit process on connection failure to prevent the server from starting in a broken state.
    process.exit(1);
  }
};

/**
 * Mongoose connection event listeners for robust logging and error handling.
 */

// Fired when the connection is successfully opened
mongoose.connection.on('connected', () => {
  console.log('Mongoose default connection open to DB instance.');
});

// Fired if the connection throws an error
mongoose.connection.on('error', (err) => {
  console.error(`Mongoose default connection error: ${err}`);
});

// Fired when the connection is disconnected
mongoose.connection.on('disconnected', () => {
  console.log('Mongoose default connection disconnected.');
});

// Fired when the connection is reconnected
mongoose.connection.on('reconnected', () => {
  console.log('Mongoose default connection reconnected.');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Mongoose default connection disconnected through app termination (SIGINT).');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await mongoose.connection.close();
  console.log('Mongoose default connection disconnected through app termination (SIGTERM).');
  process.exit(0);
});

module.exports = connectDB;