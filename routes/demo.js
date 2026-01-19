const express = require('express');
const {
  getSession,
  resetSession,
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getCoursesForBootcamp,
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
  getReviewsForBootcamp,
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
} = require('../controllers/demo');

const router = express.Router();

// Session management
router.route('/session').get(getSession).post(getSession);
router.route('/reset').delete(resetSession);

// Bootcamps
router.route('/bootcamps').get(getBootcamps).post(createBootcamp);

router
  .route('/bootcamps/:id')
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

// Courses (nested under bootcamps)
router
  .route('/bootcamps/:bootcampId/courses')
  .get(getCoursesForBootcamp)
  .post(addCourse);

// Courses (standalone)
router.route('/courses').get(getCourses);

router
  .route('/courses/:id')
  .get(getCourse)
  .put(updateCourse)
  .delete(deleteCourse);

// Reviews (nested under bootcamps)
router
  .route('/bootcamps/:bootcampId/reviews')
  .get(getReviewsForBootcamp)
  .post(addReview);

// Reviews (standalone)
router.route('/reviews').get(getReviews);

router
  .route('/reviews/:id')
  .get(getReview)
  .put(updateReview)
  .delete(deleteReview);

module.exports = router;
