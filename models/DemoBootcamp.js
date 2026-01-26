const mongoose = require('mongoose');

const DemoBootcampSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: [true, 'Session ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Please use a valid URL with HTTP or HTTPS',
      ],
    },
    email: {
      type: String,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please add a valid email'],
    },
    address: {
      type: String,
    },
    careers: {
      type: [String],
      enum: ['Web Development', 'Mobile Development', 'UI/UX', 'Data Science', 'Business', 'Other'],
    },
    housing: {
      type: Boolean,
      default: false,
    },
    jobAssistance: {
      type: Boolean,
      default: false,
    },
    jobGuarantee: {
      type: Boolean,
      default: false,
    },
    acceptGi: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'demo_bootcamps',
  }
);

// TTL index for automatic cleanup
DemoBootcampSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for session-scoped queries
DemoBootcampSchema.index({ sessionId: 1, createdAt: -1 });

// Virtual for courses
DemoBootcampSchema.virtual('courses', {
  ref: 'DemoCourse',
  localField: '_id',
  foreignField: 'bootcamp',
  justOne: false,
});

// Virtual for reviews
DemoBootcampSchema.virtual('reviews', {
  ref: 'DemoReview',
  localField: '_id',
  foreignField: 'bootcamp',
  justOne: false,
});

// Cascade delete courses when a bootcamp is deleted
DemoBootcampSchema.pre('remove', async function (next) {
  await this.model('DemoCourse').deleteMany({ bootcamp: this._id, sessionId: this.sessionId });
  await this.model('DemoReview').deleteMany({ bootcamp: this._id, sessionId: this.sessionId });
  next();
});

module.exports = mongoose.model('DemoBootcamp', DemoBootcampSchema);
