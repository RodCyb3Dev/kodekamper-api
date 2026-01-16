# Running CodeQL Locally

## Quick Setup (macOS)

### 1. Install CodeQL CLI

```bash
# Download CodeQL CLI
brew install codeql

# Or manually download from GitHub
# https://github.com/github/codeql-cli-binaries/releases
```

### 2. Download CodeQL Query Packs

```bash
# Clone CodeQL queries repository
cd ~/
git clone https://github.com/github/codeql.git codeql-home
```

### 3. Create CodeQL Database

From your project root:

```bash
# Create a CodeQL database for JavaScript
codeql database create codeql-db \
  --language=javascript \
  --source-root=.
```

### 4. Run CodeQL Analysis

```bash
# Run the security-and-quality query suite
codeql database analyze codeql-db \
  javascript-security-and-quality \
  --format=sarif-latest \
  --output=codeql-results.sarif
```

### 5. View Results

```bash
# Install SARIF viewer extension in VS Code
# Extension ID: MS-SarifVSCode.sarif-viewer

# Or view results in terminal
codeql database interpret-results codeql-db \
  --format=csv \
  --output=results.csv

# Open results.csv in your editor
```

## Faster Alternative: Use NPM Script

Add to `package.json`:

```json
{
  "scripts": {
    "codeql:create-db": "codeql database create codeql-db --language=javascript --source-root=.",
    "codeql:analyze": "codeql database analyze codeql-db javascript-security-and-quality --format=sarif-latest --output=codeql-results.sarif",
    "codeql:scan": "npm run codeql:create-db && npm run codeql:analyze",
    "codeql:clean": "rm -rf codeql-db codeql-results.sarif"
  }
}
```

Then run:

```bash
npm run codeql:scan
```

## Even Faster: GitHub CLI

Use GitHub's CodeQL Action locally with Act:

```bash
# Install Act (runs GitHub Actions locally)
brew install act

# Run CodeQL workflow locally
act pull_request --workflows .github/workflows/codeql.yml
```

## Recommended: ESLint Security Plugin (Instant Feedback)

For immediate security feedback while coding:

```bash
npm install --save-dev eslint-plugin-security
```

Your `.eslintrc.json` already has this configured!

Just run:

```bash
npm run lint
```

This catches many of the same issues CodeQL finds, but runs in seconds instead of minutes.

## What We Already Have

You already have security scanning with:

- ✅ **ESLint Security Plugin** - Instant feedback on security issues
- ✅ **npm audit** - Dependency vulnerability scanning
- ✅ **Gitleaks** - Secret detection (pre-commit + CI)

ESLint catches most issues that CodeQL finds, like:
- SQL/NoSQL injection
- XSS vulnerabilities
- Unsafe regex patterns
- Security misconfigurations

## Recommended Workflow

1. **During development**: Use ESLint (`npm run lint`)
2. **Before commit**: Gitleaks runs automatically via Husky
3. **Before push**: Run tests and lint (`npm test && npm run lint`)
4. **After push**: CodeQL runs in GitHub Actions

This gives you 90% of CodeQL's coverage without waiting for CI/CD.

## Troubleshooting

### CodeQL Database Creation Fails

If you see errors about missing dependencies:

```bash
# Install all dependencies first
npm ci

# Then create database
npm run codeql:create-db
```

### SARIF Viewer Not Working

Install VS Code extension:

```bash
code --install-extension MS-SarifVSCode.sarif-viewer
```

Then open `codeql-results.sarif` in VS Code.

## Resources

- [CodeQL CLI Documentation](https://codeql.github.com/docs/codeql-cli/)
- [CodeQL for JavaScript](https://codeql.github.com/docs/codeql-language-guides/codeql-for-javascript/)
- [GitHub CodeQL](https://github.com/github/codeql)
