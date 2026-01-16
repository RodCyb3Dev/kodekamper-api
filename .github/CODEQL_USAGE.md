# CodeQL Local Testing - Quick Reference

## ✅ Installation Complete!

CodeQL CLI is now installed and configured.

## Quick Commands

### Run Full Security Scan

```bash
npm run codeql:scan
```

This creates a database, runs analysis, and generates `codeql-results.sarif`.

### Individual Steps

```bash
# Step 1: Create CodeQL database
npm run codeql:create-db

# Step 2: Analyze the database
npm run codeql:analyze

# Clean up
npm run codeql:clean
```

## View Results

### Option 1: VS Code SARIF Viewer (Recommended)

1. Install VS Code extension:

   ```bash
   code --install-extension MS-SarifVSCode.sarif-viewer
   ```

2. Open `codeql-results.sarif` in VS Code
   - Click on findings to jump to code location
   - See detailed explanations and remediation

### Option 2: Command Line

```bash
# Convert SARIF to CSV for easier reading
codeql database interpret-results codeql-db \
  --format=csv \
  --output=results.csv

# Open in your spreadsheet or text editor
open results.csv
```

### Option 3: JSON Format

```bash
# View as prettified JSON
cat codeql-results.sarif | jq '.runs[0].results[] | {rule: .ruleId, message: .message.text, location: .locations[0].physicalLocation.artifactLocation.uri}'
```

## Workflow Recommendations

### Daily Development

Use **ESLint** for instant feedback:

```bash
npm run lint
```

ESLint catches 80% of what CodeQL finds, in seconds.

### Before Committing

Run **all quality checks**:

```bash
npm run lint && npm run format:check && npm test
```

### Before Opening PR

Run **CodeQL scan locally**:

```bash
npm run codeql:scan
```

This ensures you catch security issues before GitHub Actions runs.

### Weekly/Monthly

Run **full security suite**:

```bash
npm audit
npm run codeql:scan
brew upgrade codeql  # Keep CodeQL updated
```

## Comparison: ESLint vs CodeQL

| Tool       | Speed   | Coverage                    | When to Use        |
| ---------- | ------- | --------------------------- | ------------------ |
| **ESLint** | 3-5 sec | 80% of security issues      | During development |
| **CodeQL** | 2-3 min | 100% comprehensive analysis | Before PR, weekly  |

## Common Scenarios

### "I have 50 security warnings!"

Most are false positives or low priority. Focus on:

1. **High severity** issues first
2. **CWE-89** (SQL/NoSQL injection) - Always fix
3. **CWE-79** (XSS) - Always fix
4. **CWE-352** (CSRF) - Already handled by our middleware

### "CodeQL found something ESLint didn't"

CodeQL does deeper data flow analysis. Common findings:

- Host header injection (we fixed this)
- Cookie security issues (we have CSRF protection)
- Complex injection patterns

### "CodeQL database creation failed"

```bash
# Clean and retry
npm run codeql:clean
npm ci  # Ensure dependencies are installed
npm run codeql:create-db
```

## Tips & Tricks

### Faster Scans

Skip non-critical code:

```bash
# Add to .gitignore (already done)
codeql-db/
codeql-results.sarif
```

### Only Scan Changed Files

For incremental analysis:

```bash
git diff --name-only main | grep '\.js$' > changed-files.txt
codeql database analyze codeql-db \
  --sarif-category=incremental \
  --files=@changed-files.txt
```

### Custom Queries

Run specific security checks:

```bash
# Only check for NoSQL injection
codeql database analyze codeql-db \
  ~/codeql-queries/javascript/ql/src/Security/CWE-943/NoSQLInjection.ql \
  --format=sarif-latest
```

## Troubleshooting

### "codeql: command not found"

```bash
# Restart terminal or run:
source ~/.zshrc

# Or check installation:
brew info codeql
```

### "Analysis takes too long"

Normal for first run (2-3 min). Subsequent runs are cached.

To speed up:

```bash
# Use parallel processing
codeql database analyze codeql-db \
  --threads=4 \
  --ram=4096
```

### "Out of memory errors"

```bash
# Increase RAM allocation
codeql database analyze codeql-db \
  --ram=8192
```

## Resources

- [CodeQL Docs](https://codeql.github.com/docs/)
- [JavaScript Security Queries](https://github.com/github/codeql/tree/main/javascript/ql/src/Security)
- [SARIF Viewer Extension](https://marketplace.visualstudio.com/items?itemName=MS-SarifVSCode.sarif-viewer)

## Integration with CI/CD

Local scanning **complements** (not replaces) GitHub Actions:

- **Local**: Fast feedback during development
- **CI/CD**: Official security gate before deployment

Both should pass for production deployments.
