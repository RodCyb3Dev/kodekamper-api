const express = require('express')
const { getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampsInRadius } = require('../controllers/bootcamps')
const Bootcamp = require('../models/Bootcamp');

const router = express.Router();

const advancedResults = require('../middleware/advancedResults');

// Get bootcamps by radius
router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

// bootcamps
router.route('/').get(advancedResults(Bootcamp), getBootcamps).post(createBootcamp);

// bootcamp by ID
router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp);

module.exports = router;