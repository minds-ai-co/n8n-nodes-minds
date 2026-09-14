import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const require = createRequire(import.meta.url);

test('package exports one strict Minds node and one credential', async () => {
	const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));

	assert.equal(packageJson.name, 'n8n-nodes-minds');
	assert.equal(packageJson.n8n.strict, true);
	assert.deepEqual(packageJson.dependencies, undefined);
	assert.deepEqual(packageJson.n8n.nodes, ['dist/nodes/Minds/Minds.node.js']);
	assert.deepEqual(packageJson.n8n.credentials, ['dist/credentials/MindsApi.credentials.js']);
});

test('compiled node exposes only the five bounded Study operations', () => {
	const { Minds } = require('../dist/nodes/Minds/Minds.node.js');
	const node = new Minds();
	const operation = node.description.properties.find((property) => property.name === 'operation');
	const values = operation.options.map((option) => option.value);

	assert.deepEqual(values, ['create', 'get', 'getAll', 'getSummary', 'previewResearchPlan']);
	assert.equal(values.includes('delete'), false);
	assert.equal(values.includes('run'), false);
	assert.equal(node.description.requestDefaults.baseURL, 'https://getminds.ai/api/v1');
	assert.equal(node.description.usableAsTool, true);
});

test('compiled credential is bearer-only and checks a bounded endpoint', () => {
	const { MindsApi } = require('../dist/credentials/MindsApi.credentials.js');
	const credential = new MindsApi();

	assert.equal(credential.name, 'mindsApi');
	assert.equal(credential.properties[0].typeOptions.password, true);
	assert.equal(credential.authenticate.properties.headers.Authorization, '=Bearer {{$credentials.apiKey}}');
	assert.equal(credential.test.request.baseURL, 'https://getminds.ai/api/v1');
	assert.equal(credential.test.request.url, '/studies');
	assert.deepEqual(credential.test.request.qs, { limit: 1, offset: 0 });
});
