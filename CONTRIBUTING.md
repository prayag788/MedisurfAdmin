## Developer workflow

Follow these steps before opening a PR to keep CI fast and reliable:

- Install deps (use CI-like install):

```bash
npm ci
```

- Run formatter and commit formatting changes:

```bash
npm run format
git add .
git commit -m "chore(format): apply formatting" || true
git push
```

- Run static checks locally:

```bash
# Semgrep (install via pip or homebrew)
semgrep --config p/ci

# Lint
npm run lint

# Tests
npm test

# Build
npm run build
```

CI notes

- The `format` job intentionally fails if formatting changes are required — do not rely on CI to auto-commit formatting.
- Required checks: `format`, `semgrep`, `build`, `codeql`. The repository should enable branch protection to require these checks pass before merging.

If you cannot run these locally (e.g., Node engine mismatch), describe the problem in the PR and a maintainer will help.
