# Git Hooks Guide

## Overview

Red Square uses custom git hooks to maintain code quality and configuration consistency. All hooks are stored in `.githooks/` directory.

## Setup

### Initial Setup (Required Once Per Clone)

After cloning the repository, run:

```bash
node scripts/setup-hooks.mjs
```

This configures git to use the custom hooks in `.githooks/` instead of the default `.git/hooks/`.

## Pre-Commit Hook

The pre-commit hook runs automatically before every commit and performs the following checks:

### 1. Secret Verification
- Validates that all required environment variables are documented
- Ensures no secrets are accidentally committed to the repository
- Checks `.env.example` is up to date

### 2. SSOT Validation
- Validates all configuration files match `ssot.config.json`
- Checks for configuration drift and inconsistencies
- Ensures bundle IDs, app names, and branding are synchronized
- Scans for hardcoded values that should come from SSOT

## What Happens on Failure?

If any check fails, the commit will be **blocked** and you'll see an error message explaining what went wrong.

### Common Issues and Fixes

#### SSOT Validation Failure

**Error:** Configuration files don't match `ssot.config.json`

**Fix:**
```bash
# Regenerate all configs from SSOT
node scripts/ssot-generator.js

# Verify the fix
node scripts/ssot-validator.js

# Try committing again
git add .
git commit -m "Your message"
```

#### Secret Verification Failure

**Error:** Missing or invalid environment variables

**Fix:**
```bash
# Check what's missing
npm run verify:secrets

# Update .env.example with required variables
# Then try committing again
```

## Bypassing Hooks (Not Recommended)

In exceptional cases, you can bypass pre-commit hooks with:

```bash
git commit --no-verify -m "Your message"
```

⚠️ **Warning:** Only use this if you're absolutely sure the checks are giving false positives. Bypassing hooks can lead to:
- Inconsistent configurations across the project
- Build failures in CI/CD
- Deployment issues
- Security vulnerabilities

## Adding Custom Checks

To add new checks to the pre-commit hook:

1. Edit `.githooks/pre-commit`
2. Add your check script with clear output
3. Ensure it exits with code 1 on failure
4. Test thoroughly before committing

Example:
```bash
# Check TypeScript compilation
echo "  → Checking TypeScript..."
npm run type-check --silent || {
  echo "❌ TypeScript errors detected!"
  exit 1
}
```

## Hook Maintenance

### Testing Hooks Locally

Before committing changes to hooks, test them:

```bash
# Run pre-commit hook manually
./.githooks/pre-commit
```

### Updating Hooks for Team

When you update hooks:
1. Test them thoroughly locally
2. Commit the changes to `.githooks/`
3. Notify team members to run `node scripts/setup-hooks.mjs` again
4. Document changes in this guide

## CI/CD Integration

The same checks run in CI/CD pipelines to catch any issues that slip through:
- GitHub Actions runs all checks on every PR
- Deployment workflows include validation steps
- Build processes verify SSOT consistency

## Troubleshooting

### Hook Not Running

If hooks don't run automatically:

```bash
# Reconfigure git hooks
node scripts/setup-hooks.mjs

# Verify configuration
git config --local core.hooksPath
# Should output: .githooks
```

### Permission Issues

If you get permission errors:

```bash
# Make hooks executable
chmod +x .githooks/pre-commit
```

### False Positives

If you consistently get false positives:
1. Report the issue to the team
2. Debug the specific check causing problems
3. Update the hook script to handle the edge case
4. Document the fix in this guide

## Best Practices

1. **Always run setup-hooks.mjs after cloning** - Make it part of your onboarding checklist
2. **Don't bypass hooks without good reason** - They're there to catch real issues
3. **Keep hooks fast** - Slow hooks frustrate developers
4. **Provide clear error messages** - Developers should know exactly what's wrong
5. **Update documentation** - When you add/modify checks, update this guide

## Related Documentation

- [SSOT Architecture](./SSOT_ARCHITECTURE.md) - Understanding the Single Source of Truth system
- [SSOT Quick Start](./SSOT_QUICK_START.md) - How to work with SSOT configurations
- [GitHub Secrets Required](./GITHUB_SECRETS_REQUIRED.md) - Environment variables reference

---

**Last Updated:** 2025-01-10  
**Maintained By:** DevOps Team
