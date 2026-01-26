const mongoose = require('mongoose');

const DemoCourseSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: [true, 'Session ID is required'],
      index: true,
    },
    title: {
      type: String,
      trim: true,
      required: [true, 'Please add a course title'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    weeks: {
      type: Number,
      required: [true, 'Please add number of weeks'],
    },
    tuition: {
      type: Number,
      required: [true, 'Please add a tuition cost'],
    },
    minimumSkill: {
      type: String,
      required: [true, 'Please add a minimum skill'],
      enum: ['beginner', 'intermediate', 'advanced'],
    },
    scholarshipsAvailable: {
      type: Boolean,
      default: false,
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
    collection: 'demo_courses',
  }
);

// TTL index for automatic cleanup
DemoCourseSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for session + bootcamp queries
DemoCourseSchema.index({ sessionId: 1, bootcamp: 1 });
DemoCourseSchema.index({ sessionId: 1, createdAt: -1 });

module.exports = mongoose.model('DemoCourse', DemoCourseSchema);
