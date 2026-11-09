# Workflow Test Guide

This document provides steps to test the complete CI/CD workflow with automatic versioning using Conventional Commits.

## Test Procedure

### 1. Setup Local Repository

```bash
# Clone the repository
git clone [your-repository-url]
cd pdf-translator

# Set up remotes (if needed)
git remote -v  # Verify remote is set correctly
```

### 2. Create a Feature Branch

```bash
# Start from test branch
git checkout test
git pull origin test

# Create a feature branch
git checkout -b feature/test-workflow
```

### 3. Make Changes with Conventional Commits

Make some changes to the codebase, then commit using Conventional Commits format:

```bash
# Example: Minor feature (will increase minor version x.Y.z)
git add .
git commit -m "feat: add new translation option"

# OR Example: Bug fix (will increase patch version x.y.Z)
git add .
git commit -m "fix: correct translation error handling"

# OR Example: Breaking change (will increase major version X.y.z)
git add .
git commit -m "feat!: redesign translation UI

BREAKING CHANGE: The translation panel API has changed completely"
```

### 4. Push and Create PR to Test Branch

```bash
git push -u origin feature/test-workflow
```

Then go to GitHub and:

1. Create a Pull Request targeting the `test` branch
2. Verify that PR checks pass
3. Get approval and merge to `test` branch

### 5. Create PR from Test to Release

Once merged to `test`:

1. Create a Pull Request from `test` to `release` branch
2. Verify that PR checks pass
3. Get approval and merge to `release` branch

### 6. Create PR from Release to Main

Once merged to `release`:

1. Create a Pull Request from `release` to `main` branch
2. Verify that PR checks pass
3. Get approval and merge to `main` branch

### 7. Verify Release Generation

After merging to `main`:

1. Check the Actions tab to monitor the release workflow
2. Verify that a new release was created with:
   - Correct version number based on commit type
   - Release notes generated from commits
   - Binary assets for all platforms attached

### Expected Results

- The semantic release process should analyze your commits
- A new version should be generated based on the Conventional Commit messages
- A GitHub release should be created with the versioned binaries
- Binary assets should include:
  - Windows: `.exe` installer
  - macOS: `.dmg` file
  - Linux: `.AppImage`, `.deb`, and other Linux packages
