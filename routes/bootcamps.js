const express = require('express')
const { 
  getBootcamps, 
  getBootcamp, 
  createBootcamp, 
  updateBootcamp, 
  deleteBootcamp, 
  getBootcampsInRadius, 
  bootcampPhotoUpload 
} = require('../controllers/bootcamps')

const Bootcamp = require('../models/Bootcamp');

//Include other resource router
const courseRouter = require('./courses')
const reviewRouter = require('./reviews')

const router = express.Router();

// Re-router into other resource routers
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Get bootcamps by radius
router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

// Upload bootcamp photo
router
  .route('/:id/photo')
  .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

// bootcamps
router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(protect, authorize('publisher', 'admin'), createBootcamp);

// bootcamp by ID
router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, authorize('publisher', 'admin'), updateBootcamp)
  .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

module.exports = router;