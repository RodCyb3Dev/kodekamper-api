const express = require('express')
const { getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp } = require('../controllers/bootcamps')

const router = express.Router();

// bootcamps
router.route('/').get(getBootcamps).post(createBootcamp);

// bootcamp by ID
router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp);

module.exports = router;