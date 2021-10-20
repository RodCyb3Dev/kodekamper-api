const express = require('express')
const { getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampsInRadius } = require('../controllers/bootcamps')

const router = express.Router();

// Get bootcamps by radius
router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

// bootcamps
router.route('/').get(getBootcamps).post(createBootcamp);

// bootcamp by ID
router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp);

module.exports = router;