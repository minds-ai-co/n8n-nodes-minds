# n8n community node

- Use the official `n8n-node` CLI for linting and builds.
- Preserve the public product name `Minds`.
- Keep the package English-only to satisfy n8n verification requirements.
- Do not add runtime dependencies, environment access, filesystem access, destructive operations, or study execution without a separately reviewed product decision.
- Keep credentials encrypted through n8n credentials and never log API keys.
- Run `npm run verify` before every release.
