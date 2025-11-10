# GitHub Actions Build System - Troubleshooting Guide

## ✅ Workflow Files Status

All 19 workflow files are present and properly configured with:
- ✅ `repository_dispatch` triggers (for automated builds from app)
- ✅ `workflow_dispatch` triggers (for manual testing)

## 🔍 Verification Steps

### Step 1: Verify Workflows Are in GitHub Repository

1. Go to your GitHub repository
2. Navigate to the `.github/workflows/` folder
3. Confirm you see all 19 workflow files:
   - `redsquare-android-build.yml`
   - `redsquare-ios-build.yml`
   - `redsquare-web-build.yml`
   - `screens-android-mobile-build.yml`
   - `screens-android-tv-build.yml`
   - `screens-ios-build.yml`
   - `screens-macos-build.yml`
   - `screens-windows-build.yml`
   - `screens-linux-build.yml`
   - `screens-amazon-fire-build.yml`
   - `screens-roku-build.yml`
   - `screens-samsung-tizen-build.yml`
   - `screens-lg-webos-build.yml`
   - Plus 6 more automation workflows

**If workflows are missing:**
- Push your local code to GitHub: `git push origin main`
- Verify the `.github/workflows/` directory is not in `.gitignore`

### Step 2: Enable GitHub Actions

1. Go to your GitHub repository
2. Click **Settings** → **Actions** → **General**
3. Under "Actions permissions", ensure it's set to:
   - ✅ **Allow all actions and reusable workflows** (recommended)
   - OR **Allow [organization] actions and reusable workflows**
4. Click **Save**

### Step 3: Manually Test a Workflow

Since all workflows have `workflow_dispatch` enabled, you can manually trigger them:

1. Go to your GitHub repository
2. Click **Actions** tab
3. In the left sidebar, select a workflow (e.g., "Build RedSquare Web App")
4. Click **Run workflow** button (top right)
5. Fill in the required inputs:
   - `build_id`: Enter a test ID like `test-123`
   - `version`: Enter `1.0.0-manual`
6. Click **Run workflow**
7. Wait for the workflow to start (refresh the page)
8. Click on the running workflow to view logs

**Expected Result:** The workflow should start and you'll see it in the Actions tab.

### Step 4: Verify GitHub Secrets

Ensure all required secrets are configured in **Settings** → **Secrets and variables** → **Actions**:

#### Essential Secrets (All Workflows)
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`
- ✅ `VITE_SUPABASE_PROJECT_ID`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `GH_ACTION_SECRET`
- ✅ `VITE_MAPBOX_PUBLIC_TOKEN`
- ✅ `VITE_STRIPE_PUBLISHABLE_KEY`
- ✅ `STRIPE_SECRET_KEY`
- ✅ `RESEND_API_KEY`

#### Build Trigger Secrets
- ✅ `GH_ACCESS_TOKEN` (GitHub Personal Access Token)
- ✅ `GH_REPO_OWNER` (Your GitHub username/org)
- ✅ `GH_REPO_NAME` (Repository name)

#### Android Signing Secrets
- ⚠️ `ANDROID_SIGNING_KEY_BASE64`
- ⚠️ `ANDROID_SIGNING_KEY_ALIAS`
- ⚠️ `ANDROID_SIGNING_KEY_PASSWORD`
- ⚠️ `ANDROID_SIGNING_STORE_PASSWORD`

## 🐛 Common Issues & Solutions

### Issue 1: "No workflows found"
**Cause:** Workflow files aren't in the GitHub repository  
**Solution:** Push your code to GitHub:
```bash
git add .github/workflows/
git commit -m "Add GitHub Actions workflows"
git push origin main
```

### Issue 2: "Actions are disabled"
**Cause:** GitHub Actions is disabled in repository settings  
**Solution:** Follow Step 2 above to enable Actions

### Issue 3: "Repository dispatch not working"
**Cause:** Invalid `GH_ACCESS_TOKEN` or missing permissions  
**Solution:** 
1. Create a new GitHub Personal Access Token (Classic)
2. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
3. Click "Generate new token (classic)"
4. Give it a descriptive name: "Red Square Build System"
5. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
6. Generate token and copy it
7. Add it to Supabase Edge Functions secrets as `GH_ACCESS_TOKEN`

### Issue 4: "Workflow runs but fails immediately"
**Cause:** Missing required secrets  
**Solution:** Verify all secrets in Step 4 are configured

### Issue 5: "Build succeeds but artifact upload fails"
**Cause:** Supabase Storage bucket doesn't exist  
**Solution:** Create the following buckets in Supabase Storage:
- `apk-files` (public)
- `tv-files` (public)
- `app_artifacts` (public)

## 📊 Test Results Interpretation

### ✅ Success Indicators:
- Workflow appears in Actions tab
- Status shows "in progress" then "success"
- Artifact appears in workflow run
- Build status updates in database

### ❌ Failure Indicators:
- Workflow not triggered at all → Check Steps 1 & 2
- Workflow fails on "Update Build Status" → Check `GH_ACTION_SECRET`
- Workflow fails on "Upload to Supabase" → Check Storage buckets
- Workflow fails on build step → Check platform-specific secrets

## 🔗 Quick Links

- [GitHub Actions Status Page](https://www.githubstatus.com/)
- [Supabase Dashboard](https://supabase.com/dashboard/project/hqeyyutbuxhyildsasqq)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 📞 Next Steps

Once you've verified the workflows are accessible in GitHub:

1. **Test Manual Trigger**: Run "Build RedSquare Web App" manually (easiest to test)
2. **Check Logs**: Review the workflow run logs for any errors
3. **Test Automated Trigger**: Trigger a build from the app's Build Manager
4. **Monitor Status**: Watch the build status change in your dashboard

If manual triggers work but automated triggers don't, the issue is with the `repository_dispatch` event, which typically means:
- `GH_ACCESS_TOKEN` is invalid or has insufficient permissions
- `GH_REPO_OWNER` or `GH_REPO_NAME` is incorrect
- The edge function is sending the wrong event type

---

**Status Check Command:**
```bash
# Check if workflows are committed to git
git ls-files .github/workflows/

# Should list all 19 workflow files
```
