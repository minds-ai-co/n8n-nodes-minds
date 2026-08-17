# Security policy

Please report suspected vulnerabilities privately to developers@getminds.ai. Do not include active API keys, personal data, or customer research content in a public issue.

The node accepts a Minds API key through n8n credentials, sends it only to `https://getminds.ai/api/v1/`, and never writes it to logs or workflow output.
