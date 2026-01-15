const dotnev = require('dotenv');
const _colors = require('colors');
const connectDB = require('./config/db');
const app = require('./app');

// Load env vars
dotnev.config();

connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT
  //console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);

//Handle unhandled promise rejections
process.on('Unhandled Rejection', (_err, _promise) => {
  //console.log(`Error: ${err.message}`.red);
  //Close server & exit process
  server.close(() => process.exit(1));
});
