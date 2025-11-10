# SSOT Quick Start Guide

## What is SSOT?

**SSOT (Single Source of Truth)** means every configuration value has exactly **one authoritative source**. All other occurrences are generated from that source.

**Before SSOT:** App name hardcoded in 15 files → change 1, miss 14 = bugs  
**After SSOT:** App name in `ssot.config.json` → change 1, regenerate = all synced ✅

---

## Daily Usage

### Making Any Configuration Change

```bash
# 1. Edit the master config
vim ssot.config.json

# 2. Generate all derivative configs
npm run generate-configs

# 3. Validate everything is in sync
npm run validate-ssot

# 4. Commit both SSOT and generated files
git add ssot.config.json capacitor.config.json electron-builder.json
git commit -m "config: Update app name"
```

That's it! All files stay in sync automatically.

---

## Common Tasks

### Change App Name
```json
// ssot.config.json
{
  "applications": {
    "platform": {
      "name": "Your New Name"  ← Edit here
    }
  }
}
```
Then: `npm run generate-configs`

### Change Supabase Project
```json
// ssot.config.json
{
  "backend": {
    "supabase": {
      "projectId": "newproject123",
      "url": "https://newproject123.supabase.co"
    }
  }
}
```
Then: `npm run generate-configs`

### Change Brand Colors
```json
// ssot.config.json
{
  "assets": {
    "brand": {
      "primaryColor": "#1e40af",
      "secondaryColor": "#64748b"
    }
  }
}
```
Then: `npm run generate-configs`

---

## Available Commands

```bash
# Generate all configs from SSOT
npm run generate-configs
npm run ssot:generate

# Validate all configs match SSOT
npm run validate-ssot
npm run ssot:validate
npm run ssot:check

# Build (automatically validates first)
npm run build
```

---

## What Gets Generated?

When you run `npm run generate-configs`, these files are automatically created/updated:

- ✅ `capacitor.config.json` - Mobile app config
- ✅ `electron-builder.json` - Desktop app config
- ✅ `public/manifest.json` - PWA manifest
- ✅ `.env.example` - Environment variables template
- ✅ `src/config/ssot.generated.ts` - TypeScript constants

**Never edit these files manually!** Always edit `ssot.config.json` instead.

---

## Rules

### DO ✅
- Edit `ssot.config.json` for ALL config changes
- Run `generate-configs` after editing SSOT
- Run `validate-ssot` before committing
- Commit SSOT + generated files together

### DON'T ❌
- Manually edit generated config files
- Skip validation before builds
- Commit SSOT without regenerating
- Hardcode values in components

---

## Troubleshooting

### "Validation fails"
```bash
# Regenerate configs from SSOT
npm run generate-configs

# Check what changed
git diff capacitor.config.json
```

### "I edited a generated file by mistake"
```bash
# Restore from SSOT
npm run generate-configs

# Or revert from git
git checkout capacitor.config.json
```

### "Build fails with config error"
```bash
# Validate and show details
npm run validate-ssot -- --verbose

# Regenerate everything
npm run generate-configs
```

---

## Examples

### Example 1: Rebrand the App
```bash
# 1. Update app name in SSOT
vim ssot.config.json
# Change "name": "Red Square" to "name": "Blue Circle"

# 2. Regenerate all configs
npm run generate-configs

# 3. Verify
npm run validate-ssot

# Result: Name updated in:
# - capacitor.config.json
# - electron-builder.json
# - public/manifest.json
# - TypeScript constants
```

### Example 2: Switch Supabase Project
```bash
# 1. Update Supabase config in SSOT
vim ssot.config.json
# Change projectId and url

# 2. Regenerate configs
npm run generate-configs

# 3. Update .env with new anon key
vim .env
# VITE_SUPABASE_ANON_KEY=new_key_here

# 4. Validate
npm run validate-ssot
```

### Example 3: Add New Feature Flag
```bash
# 1. Add to SSOT
vim ssot.config.json
{
  "features": {
    "newFeature": true  ← Add this
  }
}

# 2. Regenerate
npm run generate-configs

# 3. Use in code
import { isFeatureEnabled } from '@/config/ssot.generated';

if (isFeatureEnabled('newFeature')) {
  // Your feature code
}
```

---

## When to Regenerate

**Always regenerate after editing `ssot.config.json`**

**Also regenerate when:**
- Pulling changes that modified SSOT
- Switching branches with SSOT changes
- Resolving merge conflicts in SSOT
- Setting up a new development environment

---

## Integration with Git

### Pre-commit Hook (Optional)
```bash
# .githooks/pre-commit
#!/bin/bash
npm run validate-ssot || exit 1
```

### Pre-build Validation (Automatic)
```json
// package.json
{
  "scripts": {
    "prebuild": "npm run validate-ssot",
    "build": "vite build"
  }
}
```

Builds automatically fail if configs don't match SSOT ✅

---

## Getting Help

- **Full documentation**: [SSOT_ARCHITECTURE.md](./SSOT_ARCHITECTURE.md)
- **Field reference**: [SSOT_MANIFEST.md](./SSOT_MANIFEST.md)
- **Validation errors**: Run with `--verbose` flag
- **Questions**: File issue with `[SSOT]` prefix

---

## Key Takeaways

1. **One source of truth** = `ssot.config.json`
2. **Edit source** → **Generate configs** → **Validate** → **Commit**
3. **Never manually edit** generated files
4. **Validation runs automatically** before builds
5. **All team members use the same workflow**

**Remember:** SSOT keeps your project consistent, maintainable, and bug-free! 🎯
