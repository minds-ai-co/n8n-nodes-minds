# n8n-nodes-minds

Official n8n community node for [Minds](https://getminds.ai), the synthetic market research platform. It lets a workflow create and inspect Studies, prepare a reviewable research plan, and retrieve durable results through the Minds API.

This repository is the canonical public source. The package is not available in n8n Cloud until it is published to npm and accepted through n8n's Creator Portal.

## Operations

The first release exposes five bounded operations for the `Study` resource:

| Operation | Effect |
| --- | --- |
| Get Many | Lists Studies available to the authenticated Minds account. |
| Create | Creates a Study and optionally attaches existing Audience IDs. |
| Get | Retrieves one Study, its Audiences, Minds, and messages. |
| Preview Research Plan | Creates a saved plan draft without starting research. |
| Get Summary | Retrieves the persisted whole-study summary and semantic output blocks. |

The node intentionally does not delete data or execute a study. Starting consequential research remains a separate, explicit human-confirmed step in Minds.

## Credentials

1. Create a [Minds account](https://getminds.ai).
2. Confirm that your plan includes API access on the [pricing page](https://getminds.ai/pricing).
3. Create an API key under [Settings, API Keys](https://getminds.ai/settings/api-keys).
4. In n8n, create a **Minds API** credential and paste the key into **API Key**.

n8n encrypts the credential at rest. The node sends it only as a Bearer credential to `https://getminds.ai/api/v1/`. It never reads environment variables, files, or unrelated services.

## Example workflow

1. Use **Study, Create** to create a Study from existing Audience IDs.
2. Use **Study, Preview Research Plan** with the new Study ID and a research request.
3. Review the returned draft, questions, source, and confirmation requirements in Minds.
4. After a human starts the approved study in Minds, use **Study, Get** to check progress.
5. Use **Study, Get Summary** when the study is complete.

## Importable workflows

Download a workflow from [`examples/`](examples/), then use **Import from File** in n8n and select your Minds API credential on each Minds node.

- [`list-studies.json`](examples/list-studies.json): list up to 50 Studies.
- [`prepare-research-plan.json`](examples/prepare-research-plan.json): create a Study and save a plan draft for human review. Add your existing Audience IDs before running.
- [`read-study-summary.json`](examples/read-study-summary.json): retrieve a completed Study and its saved summary. Set the Study ID before running.

## Development

Node.js 22 or later is required.

```bash
npm ci
npm run verify
```

An optional API smoke check is available at `test/live-smoke.mjs`. Inject `MINDS_API_KEY` through your credential manager, then run `node test/live-smoke.mjs` after building. It creates a clearly named verification Study and saves a plan without executing research. It prints only status checks, not payloads or credentials. This checks the compiled request expressions against the live API; interactive n8n testing remains a separate check.

To test interactively in a local n8n development instance:

```bash
npm run dev
```

## Release

See [PUBLISHING.md](PUBLISHING.md) for the npm publication and n8n verification procedure. The source being public does not mean the package is published or verified.

## Security and support

- [Security policy](https://github.com/minds-ai-co/n8n-nodes-minds/security/policy)
- [Minds API documentation](https://getminds.ai/docs/api/overview)
- [Minds MCP documentation](https://getminds.ai/mcp/overview)
- [Support](https://getminds.ai/contact)
- [Privacy policy](https://getminds.ai/legal/dataprivacy)
- [Terms of service](https://getminds.ai/legal/terms)

Minds provides early, directional synthetic research. It does not replace representative human fieldwork for high-stakes decisions. Review disagreement, limitations, and evidence before acting on a result.
