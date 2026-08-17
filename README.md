# n8n-nodes-minds

Official n8n community node for [Minds](https://getminds.ai), the synthetic market research platform. It lets a workflow create and inspect Panels, prepare a reviewable research plan, and retrieve durable results through the Minds API.

This repository is the canonical public source. The package is not available in n8n Cloud until it is published to npm and accepted through n8n's Creator Portal.

## Operations

The first release exposes five bounded operations for the `Panel` resource:

| Operation | Effect |
| --- | --- |
| Get Many | Lists Panels available to the authenticated Minds account. |
| Create | Creates a Panel and optionally attaches existing Group IDs. |
| Get | Retrieves one Panel, its Groups, Minds, and messages. |
| Preview Research Plan | Creates or revises a saved plan draft without starting research. |
| Get Summary | Retrieves the persisted whole-study summary and semantic output blocks. |

The node intentionally does not delete data or execute a study. Starting consequential research remains a separate, explicit human-confirmed step in Minds.

## Credentials

1. Create a [Minds account](https://getminds.ai).
2. Confirm that your plan includes API access on the [pricing page](https://getminds.ai/pricing).
3. Create an API key under [Settings, API Keys](https://getminds.ai/settings/api-keys).
4. In n8n, create a **Minds API** credential and paste the key into **API Key**.

n8n encrypts the credential at rest. The node sends it only as a Bearer credential to `https://getminds.ai/api/v1/`. It never reads environment variables, files, or unrelated services.

## Example workflow

1. Use **Panel, Create** to create a Panel from existing Group IDs.
2. Use **Panel, Preview Research Plan** with the new Panel ID and a research request.
3. Review the returned draft, questions, source, and confirmation requirements in Minds.
4. After a human starts the approved study in Minds, use **Panel, Get** to check progress.
5. Use **Panel, Get Summary** when the study is complete.

## Development

Node.js 22 or later is required.

```bash
npm ci
npm run verify
```

To test interactively in a local n8n development instance:

```bash
npm run dev
```

## Security and support

- [Security policy](https://github.com/minds-ai-co/n8n-nodes-minds/security/policy)
- [Minds API documentation](https://getminds.ai/api/overview)
- [Minds MCP documentation](https://getminds.ai/mcp/overview)
- [Support](https://getminds.ai/contact)
- [Privacy policy](https://getminds.ai/legal/dataprivacy)
- [Terms of service](https://getminds.ai/legal/terms)

Minds provides early, directional synthetic research. It does not replace representative human fieldwork for high-stakes decisions. Review disagreement, limitations, and evidence before acting on a result.
