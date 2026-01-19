const crypto = require('crypto');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const DemoBootcamp = require('../models/DemoBootcamp');
const DemoCourse = require('../models/DemoCourse');
const DemoReview = require('../models/DemoReview');

// Demo session TTL: 2 hours
const DEMO_SESSION_TTL_MS = 2 * 60 * 60 * 1000;

/**
 * Get or create demo session
 * @route   GET/POST /api/v1/demo/session
 * @access  Public
 */
exports.getSession = asyncHandler(async (req, res, next) => {
  let sessionId = req.cookies.demo_sid;

  if (!sessionId || sessionId.length < 16) {
    sessionId = crypto.randomBytes(16).toString('hex');
  }

  const expiresAt = new Date(Date.now() + DEMO_SESSION_TTL_MS);

  res.cookie('demo_sid', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: DEMO_SESSION_TTL_MS,
  });

  res.status(200).json({
    success: true,
    data: {
      sessionId,
      expiresAt,
      ttlMinutes: DEMO_SESSION_TTL_MS / 1000 / 60,
    },
  });
});

/**
 * Reset demo session (delete all demo data for this session)
 * @route   DELETE /api/v1/demo/reset
 * @access  Public
 */
exports.resetSession = asyncHandler(async (req, res, next) => {
  const sessionId = req.cookies.demo_sid;

  if (!sessionId) {
    return next(new ErrorResponse('No demo session found', 400));
  }

  // Delete all demo data for this session
  await Promise.all([
    DemoBootcamp.deleteMany({ sessionId }),
    DemoCourse.deleteMany({ sessionId }),
    DemoReview.deleteMany({ sessionId }),
  ]);

  res.status(200).json({
    success: true,
    data: { message: 'Demo session reset successfully' },
  });
});

/**
 * Get all demo bootcamps for session
 * @route   GET /api/v1/demo/bootcamps
 * @access  Public
 */
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  const sessionId = req.cookies.demo_sid;

  if (!sessionId) {
    return next(new ErrorResponse('Demo session required', 400));
  }

  const bootcamps = await DemoBootcamp.find({ sessionId }).sort('-createdAt');

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

/**
 * Get single demo bootcamp
 * @route   GET /api/v1/demo/bootcamps/:id
 * @access  Public
 */
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const sessionId = req.cookies.demo_sid;

  if (!sessionId) {
    return next(new ErrorResponse('Demo session required', 400));
  }

  const bootcamp = await DemoBootcamp.findOne({
    _id: req.params.id,
    sessionId,
  }).populate('courses');

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, data: bootcamp });
});

/**
 * Create demo bootcamp
 * @route   POST /api/v1/demo/bootcamps
 * @access  Public
 */
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const sessionId = req.cookies.demo_sid;

  if (!sessionId) {
    return next(new ErrorResponse('Demo session required', 400));
  }

  const expiresAt = new Date(Date.now() + DEMO_SESSION_TTL_MS);

  const bootcamp = await DemoBootcamp.create({
    ...req.body,
    sessionId,
    expiresAt,
  });

  res.status(201).json({ success: true, data: bootcamp });
});

/**
 * Update demo bootcamp
 * @route   PUT /api/v1/demo/bootcamps/:id
 * @access  Public
 */
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const sessionId = req.cookies.demo_sid;

  if (!sessionId) {
    return next(new ErrorResponse('Demo session required', 400));
  }

  let bootcamp = await DemoBootcamp.findOne({
    _id: req.params.id,
    sessionId,
  });

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
  }

  // Don't allow updating sessionId or expiresAt
  delete req.body.sessionId;
  delete req.body.expiresAt;

  bootcamp = await DemoBootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: bootcamp });
});

/**
 * Delete demo bootcamp
 * @route   DELETE /api/v1/demo/bootcamps/:id
 * @access  Public
 */
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const sessionId = req.cookies.demo_sid;

  if (!sessionId) {
    return next(new ErrorResponse('Demo session required', 400));
  }

  const bootcamp = await DemoBootcamp.findOne({
    _id: req.params.id,
    sessionId,
  });

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
  }

  // Cascade delete courses and reviews
  await DemoCourse.deleteMany({ bootcamp: bootcamp._id, sessionId });
  await DemoReview.deleteMany({ bootcamp: bootcamp._id, sessionId });
  await bootcamp.deleteOne();

  res.status(200).json({ success: true, data: {} });
});

/**
 * Get courses for a bootcamp
 * @route   GET /api/v1/demo/bootcamps/:bootcampId/courses
 * @access  Public
 */
exports.getCoursesForBootcamp = asyncHandler(async (req, res, next) => {
  const sessionId = req.cookies.demo_sid;

  if (!sessionId) {
    return next(new ErrorResponse('Demo session required', 400));
  }

  // Verify bootcamp exists and belongs to session
  const bootcamp = await DemoBootcamp.findOne({
    _id: req.params.bootcampId,
    sessionId,
  });

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.bootcampId}`, 404));
  }

  const courses = await DemoCourse.find({
    bootcamp: req.params.bootcampId,
    sessionId,
  }).sort('-createdAt');

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses,
  });
});

/**
 * Get all courses
 * @route   GET /api/v1/demo/courses
 * @access  Public
 */
exports.getCourses = asyncHandler(async (req, res, next) => {
  const sessionId = req.cookies.demo_sid;

  if (!sessionId) {
    return next(new ErrorResponse('Demo session required', 400));
  }

  const courses = await DemoCourse.find({ sessionId }).populate({
    path: 'bootcamp',
    select: 'name description',
  }).sort('-createdAt');

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses,
  });
});

/**
 * Get single course
 * @route   GET /api/v1/demo/courses/:id
 * @access  Public
 */
exports.getCourse = asyncHandler(async (req, res, next) => {
  const sessionId = req.cookies.demo_sid;

  if (!sessionId) {
    return next(new ErrorResponse('Demo session required', 400));
  }

  const course = await DemoCourse.findOne({
    _id: req.params.id,
    sessionId,
  }).populate({
    path: 'bootcamp',
    select: 'name description',
  });

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, data: course });
});

/**
 * Add course to bootcamp
 * @route   POST /api/v1/demo/bootcamps/:bootcampId/courses
 * @access  Public
 */
exports.addCourse = asyncHandler(async (req, res, next) => {
  const sessionId = req.cookies.demo_sid;

  if (!sessionId) {
    return next(new ErrorResponse('Demo session required', 400));
  }

  // Verify bootcamp exists and belongs to session
  const bootcamp = await DemoBootcamp.findOne({
    _id: req.params.bootcampId,
    sessionId,
  });

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.bootcampId}`, 404));
  }

  const expiresAt = new Date(Date.now() + DEMO_SESSION_TTL_MS);

  const course = await DemoCourse.create({
    ...req.body,
    bootcamp: req.params.bootcampId,
    sessionId,
    expiresAt,
  });

  res.status(201).json({ success: true, data: course });
});

/**
 * Update course
 * @route   PUT /api/v1/demo/courses/:id
 * @access  Public
 */
exports.updateCourse = asyncHandler(async (req, res, next) => {
  const sessionId = req.cookies.demo_sid;

  if (!sessionId) {
    return next(new ErrorResponse('Demo session required', 400));
  }

  let course = await DemoCourse.findOne({
    _id: req.params.id,
    sessionId,
  });

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  // Don't allow updating sessionId, bootcamp, or expiresAt
  delete req.body.sessionId;
  delete req.body.bootcamp;
  delete req.body.expiresAt;

  course = await DemoCourse.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: course });
});

/**
 * Delete course
 * @route   DELETE /api/v1/demo/courses/:id
 * @access  Public
 */
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const sessionId = req.cookies.demo_sid;

  if (!sessionId) {
    return next(new ErrorResponse('Demo session required', 400));
  }

  const course = await DemoCourse.findOne({
    _id: req.params.id,
    sessionId,
  });

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  await course.deleteOne();

  res.status(200).json({ success: true, data: {} });
});

/**
 * Get reviews for a bootcamp
 * @route   GET /api/v1/demo/bootcamps/:bootcampId/reviews
 * @access  Public
 */
exports.getReviewsForBootcamp = asyncHandler(async (req, res, next) => {
  const sessionId = req.cookies.demo_sid;

  if (!sessionId) {
    return next(new ErrorResponse('Demo session required', 400));
  }

  // Verify bootcamp exists and belongs to session
  const bootcamp = await DemoBootcamp.findOne({
    _id: req.params.bootcampId,
    sessionId,
  });

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.bootcampId}`, 404));
  }

  const reviews = await DemoReview.find({
    bootcamp: req.params.bootcampId,
    sessionId,
  }).sort('-createdAt');

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});

/**
 * Get all reviews
 * @route   GET /api/v1/demo/reviews
 * @access  Public
 */
exports.getReviews = asyncHandler(async (req, res, next) => {
  const sessionId = req.cookies.demo_sid;

  if (!sessionId) {
    return next(new ErrorResponse('Demo session required', 400));
  }

  const reviews = await DemoReview.find({ sessionId }).populate({
    path: 'bootcamp',
    select: 'name description',
  }).sort('-createdAt');

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});

/**
 * Get single review
 * @route   GET /api/v1/demo/reviews/:id
 * @access  Public
 */
exports.getReview = asyncHandler(async (req, res, next) => {
  const sessionId = req.cookies.demo_sid;

  if (!sessionId) {
    return next(new ErrorResponse('Demo session required', 400));
  }

  const review = await DemoReview.findOne({
    _id: req.params.id,
    sessionId,
  }).populate({
    path: 'bootcamp',
    select: 'name description',
  });

  if (!review) {
    return next(new ErrorResponse(`Review not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, data: review });
});

/**
 * Add review to bootcamp
 * @route   POST /api/v1/demo/bootcamps/:bootcampId/reviews
 * @access  Public
 */
exports.addReview = asyncHandler(async (req, res, next) => {
  const sessionId = req.cookies.demo_sid;

  if (!sessionId) {
    return next(new ErrorResponse('Demo session required', 400));
  }

  // Verify bootcamp exists and belongs to session
  const bootcamp = await DemoBootcamp.findOne({
    _id: req.params.bootcampId,
    sessionId,
  });

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.bootcampId}`, 404));
  }

  const expiresAt = new Date(Date.now() + DEMO_SESSION_TTL_MS);

  const review = await DemoReview.create({
    ...req.body,
    bootcamp: req.params.bootcampId,
    sessionId,
    expiresAt,
  });

  res.status(201).json({ success: true, data: review });
});

/**
 * Update review
 * @route   PUT /api/v1/demo/reviews/:id
 * @access  Public
 */
exports.updateReview = asyncHandler(async (req, res, next) => {
  const sessionId = req.cookies.demo_sid;

  if (!sessionId) {
    return next(new ErrorResponse('Demo session required', 400));
  }

  let review = await DemoReview.findOne({
    _id: req.params.id,
    sessionId,
  });

  if (!review) {
    return next(new ErrorResponse(`Review not found with id of ${req.params.id}`, 404));
  }

  // Don't allow updating sessionId, bootcamp, or expiresAt
  delete req.body.sessionId;
  delete req.body.bootcamp;
  delete req.body.expiresAt;

  review = await DemoReview.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: review });
});

/**
 * Delete review
 * @route   DELETE /api/v1/demo/reviews/:id
 * @access  Public
 */
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const sessionId = req.cookies.demo_sid;

  if (!sessionId) {
    return next(new ErrorResponse('Demo session required', 400));
  }

  const review = await DemoReview.findOne({
    _id: req.params.id,
    sessionId,
  });

  if (!review) {
    return next(new ErrorResponse(`Review not found with id of ${req.params.id}`, 404));
  }

  await review.deleteOne();

  res.status(200).json({ success: true, data: {} });
});
