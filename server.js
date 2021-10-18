const express = require('express');
const dotnev = require('dotenv');
const morgan = require('morgan');

// Routes files
const bootcamps = require('./routes/bootcamps');

// Load env vars
dotnev.config({ path: './config/config.env' });

const app = express();

// Dev logging middleware
if(process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routers
app.use('/api/v1/bootcamps', bootcamps)

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));