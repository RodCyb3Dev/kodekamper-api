const path = require('path');
const express = require('express');
const morgan = require('morgan');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const { doubleCsrf } = require('csrf-csrf');
const { globalLimiter } = require('./middleware/rateLimiters');
const botBlocker = require('./middleware/botBlocker');
const hpp = require('hpp');
const cors = require('cors');
const errorHandler = require('./middleware/error');
const cacheResponse = require('./middleware/cache');

// Route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');
const health = require('./routes/health');

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

// Body parser
app.use(express.json({ limit: '10kb' }));

// Cookie parser
app.use(cookieParser());

// CSRF protection
const { doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production',
  cookieName: '__Host-psifi.x-csrf-token',
  cookieOptions: {
    sameSite: 'strict',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
});

// Apply CSRF protection to state-changing requests (POST, PUT, PATCH, DELETE)
if (process.env.NODE_ENV !== 'test') {
  app.use(doubleCsrfProtection);
}

// Block known scanning/bot user-agents
app.use(botBlocker);

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// File uploading
app.use(fileupload());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet({ contentSecurityPolicy: false }));
/*
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      styleSrc:  ["'self' https: 'unsafe-inline'"],
      scriptSrc: ["'unsafe-inline'", "https://getbootstrap.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);
*/

// Prevent XSS attacks
app.use(xss());

// Rate limiting
app.use(globalLimiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Health check (cached for 10s)
app.use('/api/v1/health', cacheResponse(10), health);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

app.use(errorHandler);

module.exports = app;
