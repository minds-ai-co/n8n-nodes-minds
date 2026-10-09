# n8n community node

> **Before any work:** every request to change this repository passes the [ship decision gate](https://github.com/minds-ai-co/agent-guard/blob/main/GATE.md) first, before planning, specifying or writing code. Tell the requester the verdict and record it with `agent-guard record --issue <N>` (install once per machine: `npx -y github:minds-ai-co/agent-guard install`). Git hooks refuse commits and pushes on a branch without a verdict that allows work, and agent hooks refuse edits. (This repository is outside the org's required **Ship decision** PR check.)

- Use the official `n8n-node` CLI for linting and builds.
- Preserve the public product name `Minds`.
- Keep the package English-only to satisfy n8n verification requirements.
- Do not add runtime dependencies, environment access, filesystem access, destructive operations, or study execution without a separately reviewed product decision.
- Keep credentials encrypted through n8n credentials and never log API keys.
- Run `npm run verify` before every release.
