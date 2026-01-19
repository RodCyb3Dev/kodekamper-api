const mongoose = require('mongoose');

const DemoReviewSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: [true, 'Session ID is required'],
      index: true,
    },
    title: {
      type: String,
      trim: true,
      required: [true, 'Please add a title for the review'],
      maxlength: 100,
    },
    text: {
      type: String,
      required: [true, 'Please add some text'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 10,
      required: [true, 'Please add a rating between 1 and 10'],
    },
    bootcamp: {
      type: mongoose.Schema.ObjectId,
      ref: 'DemoBootcamp',
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'demo_reviews',
  }
);

// TTL index for automatic cleanup
DemoReviewSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for session + bootcamp queries
DemoReviewSchema.index({ sessionId: 1, bootcamp: 1 });
DemoReviewSchema.index({ sessionId: 1, createdAt: -1 });

module.exports = mongoose.model('DemoReview', DemoReviewSchema);
