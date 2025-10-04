# GitHub Contributions Setup

This project uses a custom GitHub contribution graph with **real data** fetched automatically via GitHub Actions.

## How It Works

1. **GitHub Action** runs daily (or on manual trigger)
2. Fetches your real contribution data from GitHub GraphQL API
3. Generates `contributions.json` in the repository
4. Client-side code renders a custom SVG visualization with dark theme

## Setup Instructions

### Step 1: Create GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: `Contributions Data Access`
4. Set expiration: Choose your preference (or "No expiration")
5. Select scopes:
   - ✅ **`read:user`** - Read user profile data
   - That's all! (No write permissions needed)
6. Click **"Generate token"**
7. **Copy the token** (you won't see it again!)

### Step 2: Add Token to Repository Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `CONTRIBUTIONS_TOKEN`
5. Value: Paste the token you copied
6. Click **"Add secret"**

### Step 3: Run the GitHub Action

#### Option A: Wait for Automatic Run
The action runs automatically every day at midnight UTC.

#### Option B: Manual Trigger (Recommended for first time)
1. Go to **Actions** tab in your repository
2. Select **"Update GitHub Contributions"** workflow
3. Click **"Run workflow"** → **"Run workflow"**
4. Wait ~30 seconds for it to complete
5. Check that `contributions.json` was created in the repository

### Step 4: Verify It Works

1. Visit your website's projects page
2. You should see the custom dark-themed contribution graph
3. The graph shows your **real GitHub contributions**

## Troubleshooting

### "Contribution data not yet available" message
- The GitHub Action hasn't run yet
- Manually trigger it from the Actions tab
- Check the action logs for errors

### Action fails with authentication error
- Verify the token is correctly added to Secrets
- Make sure the secret name is exactly: `CONTRIBUTIONS_TOKEN`
- Check that the token has `read:user` scope

### JSON file not updating
- Check the Actions tab for error logs
- Ensure the bot has permission to commit to the repository
- Verify the workflow file is in `.github/workflows/update-contributions.yml`

## File Structure

```
.github/
  workflows/
    update-contributions.yml  # GitHub Action workflow

contributions.json            # Generated data (auto-updated daily)
github-contributions.js       # Custom SVG renderer
GITHUB_CONTRIBUTIONS_SETUP.md # This file
```

## Security Note

The GitHub token is stored securely in GitHub Secrets and is **never** exposed in:
- Client-side code
- Repository files
- Public logs

The token only has read-only access to public profile data.
