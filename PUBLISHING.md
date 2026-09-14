# Publishing Minds for n8n

Package: `n8n-nodes-minds`. Canonical source: https://github.com/minds-ai-co/n8n-nodes-minds.

## Release procedure

1. Run `npm ci` and `npm run verify`. Exercise the importable workflows with a Minds account that has API access. Select the credential inside n8n; never put keys in workflow JSON.
2. For the first publication, configure a Minds-owned npm publisher and a granular publishing token authorized for this package, with the appropriate automation/2FA permissions. Store it as the repository Actions secret `NPM_TOKEN`. Do not publish from a local machine: n8n requires GitHub Actions provenance.
3. Commit the reviewed release, then tag it with the matching package version (for example, `v0.1.0`) and push the tag. The `Publish` workflow verifies the package, publishes with provenance, and runs the official n8n scanner. A failed publishing job can be rerun after fixing authentication; a published version cannot be overwritten.
4. Inspect the npm version, repository link, contents, and provenance. If only the post-publication scan fails, use the separate security-scan workflow; do not republish that version.
5. Configure npm trusted publishing for organization `minds-ai-co`, repository `n8n-nodes-minds`, workflow `publish.yml`, allowing direct `npm publish`. Subsequent releases use GitHub OIDC. Verify a release through OIDC before removing the bootstrap token.
6. Sign in to https://creators.n8n.io/nodes, check for an existing submission, and submit this package once. Record the portal's actual status in company knowledge. Publication, submission, acceptance, and in-product availability are separate milestones.

## Submission copy

- **Integration name:** Minds
- **Package:** n8n-nodes-minds
- **Website:** https://getminds.ai
- **Repository:** https://github.com/minds-ai-co/n8n-nodes-minds
- **Support:** developers@getminds.ai
- **Description:** Create and inspect Studies, prepare research plans for human review, and retrieve saved summaries from Minds, a synthetic market research platform.
- **Authentication:** Minds API key stored in n8n credentials and sent as a Bearer header only to the Minds API.
- **Operations:** Study Create, Get, Get Many, Preview Research Plan, Get Summary.
- **Reviewer path:** Import the examples, select a Minds credential with API access, list Studies, create a Study with existing Audience IDs, preview its plan, and inspect its saved summary. An empty Study may have no completed summary. Research execution happens separately in Minds.
- **Implementation:** Declarative TypeScript node; one third-party service; MIT license; no external runtime dependencies; no environment or filesystem access in the published node; English UI and documentation.

Supply any reviewer credential only through the portal's designated private mechanism. Do not put it in an issue, README, example, or company knowledge.

## Official requirements

- https://docs.n8n.io/connect/create-nodes/deploy-your-node/submit-community-nodes/
- https://docs.n8n.io/connect/create-nodes/build-your-node/reference/verification-guidelines/
- https://docs.npmjs.com/trusted-publishers/
