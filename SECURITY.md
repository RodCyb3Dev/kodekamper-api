# Security

## Overview

KodeKamper API implements multiple layers of security to protect against common web vulnerabilities and attacks.

## Security Features

### 1. CSRF Protection

**Package**: `csrf-csrf` (modern replacement for deprecated `csurf`)

**Implementation**:

- Double-submit cookie pattern
- Automatic protection for state-changing requests (POST, PUT, PATCH, DELETE)
- GET, HEAD, OPTIONS requests are exempt
- Disabled in test environment for easier testing

**Configuration**: [app.js](app.js)

```javascript
const { doubleCsrf } = require('csrf-csrf');

const { doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET,
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
```

**Environment Variable**: `CSRF_SECRET` (required in production)

### 2. Host Header Validation

**Issue**: Password reset URLs were vulnerable to Host header injection attacks.

**Fix**: Password reset emails now use a trusted base URL from environment configuration instead of the HTTP Host header.

**Configuration**: `APP_BASE_URL` environment variable

- Production: `https://kodekamper.app`
- Staging: `https://staging.kodekamper.app`
- Development: `http://localhost:5000`

**Implementation**: [controllers/auth.js](controllers/auth.js)

```javascript
const baseUrl = process.env.APP_BASE_URL || `${req.protocol}://localhost:5000`;
const resetUrl = `${baseUrl}/api/v1/auth/resetpassword/${resetToken}`;
```

### 3. Rate Limiting

**Global Rate Limit**:

- 100 requests per 10 minutes per IP
- Applies to all routes

**Auth Route Rate Limit**:

- 20 requests per 15 minutes per IP
- Applies to `/api/v1/auth/*` endpoints
- Protects against brute force attacks on login/registration

**Implementation**: [middleware/rateLimiters.js](middleware/rateLimiters.js)

### 4. Bot & Scanner Protection

**Blocks**:

- Known scanner user-agents (Nikto, sqlmap, w3af, etc.)
- Suspicious paths (wp-admin, phpmyadmin, .env, etc.)

**Implementation**: [middleware/botBlocker.js](middleware/botBlocker.js)

### 5. Input Sanitization

**NoSQL Injection Prevention**:

- Package: `express-mongo-sanitize`
- Removes `$` and `.` from user input
- Prevents MongoDB operator injection

**XSS Prevention**:

- Package: `xss-clean`
- Sanitizes user input to prevent cross-site scripting
- Cleans HTML from request body, query params, and URL params

**HTTP Parameter Pollution**:

- Package: `hpp`
- Protects against parameter pollution attacks
- Takes last parameter value if duplicates exist

### 6. Security Headers

**Package**: `helmet`

**Headers Set**:

- `X-DNS-Prefetch-Control`: Controls browser DNS prefetching
- `X-Frame-Options`: Prevents clickjacking
- `X-Content-Type-Options`: Prevents MIME-type sniffing
- `Strict-Transport-Security`: Enforces HTTPS
- `X-Download-Options`: Prevents downloads in older IE
- `X-Permitted-Cross-Domain-Policies`: Controls cross-domain policies

**Note**: Content Security Policy (CSP) is currently disabled for compatibility.

### 7. CORS

**Package**: `cors`

**Configuration**: Allows cross-origin requests from all origins (development/API configuration).

**Production Recommendation**: Restrict to specific domains:

```javascript
app.use(
  cors({
    origin: ['https://kodekamper.app', 'https://staging.kodekamper.app'],
    credentials: true,
  })
);
```

### 8. Request Size Limiting

**Limit**: 10KB per request body

**Purpose**: Prevents DoS attacks via large payloads

**Implementation**:

```javascript
app.use(express.json({ limit: '10kb' }));
```

### 9. Authentication & Authorization

**Method**: JWT (JSON Web Tokens)

**Features**:

- Token-based authentication
- Role-based access control (user, publisher, admin)
- Password hashing with bcrypt
- Password reset via email tokens
- Token expiration

**Implementation**: [middleware/auth.js](middleware/auth.js)

### 10. File Upload Security

**Package**: `express-fileupload`

**Restrictions**:

- Max file size: 1MB (configurable)
- Upload path: `./public/uploads`
- File type validation in controllers

### 11. Environment Variable Security

**Best Practices**:

- All secrets stored in `.env` files (gitignored)
- Kamal secrets stored in `.kamal/secrets.*` files (gitignored)
- GitHub Actions uses encrypted secrets
- No secrets committed to repository

## Secret Scanning

### Gitleaks

**Purpose**: Prevents accidental commit of secrets

**CI/CD**: Runs on every PR and push to main/staging branches

**Pre-commit Hook**: Runs locally via Husky before every commit

**Configuration**: [.gitleaks.toml](.gitleaks.toml)

**Install locally**:

```bash
brew install gitleaks
```

## Static Analysis

### CodeQL

**Purpose**: Identifies security vulnerabilities in code

**Scans for**:

- SQL injection
- XSS vulnerabilities
- Command injection
- Path traversal
- Information exposure
- Weak cryptography
- And more...

**Schedule**: Runs weekly and on every PR

**Configuration**: [.github/workflows/codeql.yml](.github/workflows/codeql.yml)

## Security Checklist

### Before Deployment

- [ ] Set strong `JWT_SECRET` (64+ random characters)
- [ ] Set strong `CSRF_SECRET` (64+ random characters)
- [ ] Configure `APP_BASE_URL` to production domain
- [ ] Enable HTTPS (handled by kamal-proxy automatically)
- [ ] Review CORS allowed origins
- [ ] Verify file upload restrictions
- [ ] Check MongoDB/Redis are not publicly accessible
- [ ] Ensure all secrets are in environment variables, not code
- [ ] Run `npm audit` and fix high/critical vulnerabilities
- [ ] Run Gitleaks scan: `gitleaks detect --source . --verbose`
- [ ] Review CodeQL alerts in GitHub Security tab

### Production Hardening

1. **Restrict CORS** to specific domains
2. **Enable CSP** headers with appropriate directives
3. **Use HTTPS only** (enforced by kamal-proxy)
4. **Rotate secrets** regularly (JWT_SECRET, CSRF_SECRET)
5. **Monitor logs** for suspicious activity
6. **Keep dependencies updated** (`npm audit`, `npm update`)
7. **Review user permissions** (principle of least privilege)

## Reporting Security Issues

If you discover a security vulnerability, please email: [security@kodeflash.dev](mailto:security@kodeflash.dev)

**Do not** open a public GitHub issue for security vulnerabilities.

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [npm Security Best Practices](https://docs.npmjs.com/packages-and-modules/securing-your-code)

## Audit History

| Date       | Tool      | Critical | High | Medium | Low | Status    |
| ---------- | --------- | -------- | ---- | ------ | --- | --------- |
| 2026-01-16 | CodeQL    | 0        | 2    | -      | -   | ✅ Fixed  |
| 2026-01-16 | npm audit | 6        | 12   | 11     | 7   | ⚠️ Review |
| 2026-01-15 | Gitleaks  | 0        | 0    | 0      | 0   | ✅ Clean  |

## Recent Security Improvements

### January 16, 2026

**CSRF Protection Added**:

- Migrated from deprecated `csurf` to modern `csrf-csrf` package
- Implemented double-submit cookie pattern
- Automatic protection for POST/PUT/PATCH/DELETE requests
- Test environment exemption for easier testing

**Host Header Validation**:

- Fixed password reset URL vulnerability
- Now uses trusted `APP_BASE_URL` from environment
- Prevents host header injection attacks

**CodeQL Integration**:

- Added automated security scanning
- Weekly scans + PR checks
- JavaScript/TypeScript security analysis

**Gitleaks Integration**:

- Pre-commit secret scanning
- CI/CD secret detection
- Prevents accidental secret commits
