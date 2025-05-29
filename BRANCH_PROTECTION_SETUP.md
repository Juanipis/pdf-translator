# Branch Protection Rules Setup

To ensure code quality and maintain a proper workflow, set up the following branch protection rules in GitHub:

## 1. Main Branch Protection

- **Navigate to**: Settings > Branches > Add rule
- **Branch name pattern**: `main`
- **Protect matching branches**:
  - ✅ Require a pull request before merging
    - ✅ Require approvals (at least 1)
    - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require status checks to pass before merging
    - ✅ Require branches to be up to date before merging
    - Required status checks:
      - `Pull Request Checks / verify`
      - `Automatic Release / version`
  - ✅ Require conversation resolution before merging
  - ✅ Include administrators
  - ✅ Restrict who can push to matching branches
    - Add repository maintainers

## 2. Release Branch Protection

- **Navigate to**: Settings > Branches > Add rule
- **Branch name pattern**: `release`
- **Protect matching branches**:
  - ✅ Require a pull request before merging
    - ✅ Require approvals (at least 1)
  - ✅ Require status checks to pass before merging
    - ✅ Require branches to be up to date before merging
    - Required status checks:
      - `Pull Request Checks / verify`
  - ✅ Require conversation resolution before merging
  - ✅ Include administrators

## 3. Test Branch Protection

- **Navigate to**: Settings > Branches > Add rule
- **Branch name pattern**: `test`
- **Protect matching branches**:
  - ✅ Require a pull request before merging
  - ✅ Require status checks to pass before merging
    - Required status checks:
      - `CI on Test Branch / build-and-test`
  - ✅ Include administrators

## Workflow Summary

1. Create a feature branch from `test`
2. Make your changes with Conventional Commits format (feat, fix, docs, etc.)
3. Create PR to `test` branch
4. After PR is approved and CI passes, merge to `test`
5. Create PR from `test` to `release`
6. After PR is approved and checks pass, merge to `release`
7. Create PR from `release` to `main`
8. After PR is approved and checks pass, merge to `main`
9. The merge to `main` will trigger the semantic release process and generate a new version based on commit history
