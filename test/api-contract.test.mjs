import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { Minds } = require('../dist/nodes/Minds/Minds.node.js');
const { MindsApi } = require('../dist/credentials/MindsApi.credentials.js');
const description = new Minds().description;
const properties = description.properties;
const contract = JSON.parse(
	await readFile(new URL('./fixtures/studies-openapi.json', import.meta.url)),
);
const operations = properties.find((property) => property.name === 'operation').options;
const { Expression, NodeHelpers } = require('n8n-workflow');
const expression = new Expression('UTC');

function previewSourceBody(parameters) {
	const body = {};
	for (const property of properties) {
		const send = property.routing?.send;
		if (send?.type !== 'body' || !send.property.startsWith('source.')) continue;
		if (!NodeHelpers.displayParameter(parameters, property, null, description)) continue;
		const value = parameters[property.name] ?? property.default;
		const resolved = send.value === undefined
			? value
			: expression.resolveSimpleParameterValue(send.value, { $value: value, $parameter: parameters });
		if (send.propertyInDotNotation) {
			body.source ??= {};
			body.source[send.property.slice('source.'.length)] = resolved;
		} else {
			body[send.property] = resolved;
		}
	}
	return JSON.parse(JSON.stringify(body));
}

// Contract: webapp/server/utils/research/plan-preview-contract.ts sourceSchema.
// Only prompts accept content; document/image/video/website require a URL.
const sourceUrl = 'https://example.com/research-source';
const sourceContent = 'Respondent-visible research stimulus';
for (const [kind, url, expectedFields] of [
	['prompt', sourceUrl, { content: sourceContent }],
	['document', sourceUrl, { url: sourceUrl }],
	['image', sourceUrl, { url: sourceUrl }],
	['video', sourceUrl, { url: sourceUrl }],
	['website', sourceUrl, { url: sourceUrl }],
	['questionnaire', sourceUrl, { url: sourceUrl }],
	['other', sourceUrl, { url: sourceUrl }],
	['questionnaire', '', {}],
	['other', '', {}],
]) {
	test(`preview ${kind} source ${url ? 'with' : 'without'} URL matches the server contract`, () => {
		const parameters = {
			resource: 'study',
			operation: 'previewResearchPlan',
			sourceKind: kind,
			sourceLabel: 'Research stimulus',
			// Retained values from switching kinds must not leak into the request.
			sourceContent,
			sourceUrl: url,
		};
		assert.deepEqual(previewSourceBody(parameters), {
			source: { kind, label: parameters.sourceLabel, ...expectedFields },
		});
	});
}

test('n8n expressions preserve audience arrays and keep study IDs inside one path segment', () => {
	const audienceIds = properties.find((property) => property.name === 'audienceIds').routing.send
		.value;
	assert.deepEqual(expression.resolveSimpleParameterValue(audienceIds, { $value: ' a, b, , ' }), [
		'a',
		'b',
	]);
	assert.deepEqual(expression.resolveSimpleParameterValue(audienceIds, { $value: '' }), []);
	const request = operations.find((operation) => operation.value === 'get').routing.request;
	assert.equal(
		expression.resolveSimpleParameterValue(request.url, {
			$parameter: { studyId: 'id/with?query' },
		}),
		'/studies/id%2Fwith%3Fquery',
	);
});

function pathFor(request) {
	return `/api/v1${request.url.replace(/^=/, '').replace(/\{\{encodeURIComponent\(\$parameter.studyId\)\}\}/g, '{studyId}')}`;
}

test('every operation targets a documented method and extracts the documented data envelope', () => {
	for (const operation of operations) {
		const request = operation.routing.request;
		const endpoint = contract.paths[pathFor(request)]?.[request.method.toLowerCase()];
		assert.ok(endpoint, `Missing API contract for ${operation.name}`);
		const response = endpoint.responses['200'] ?? endpoint.responses['201'];
		assert.ok(response.content['application/json'].schema.required.includes('data'));
		assert.equal(operation.routing.output.postReceive[0].properties.property, 'data');
	}
});

test('create and preview body fields match the live API snapshot, including nested source fields', () => {
	for (const operation of operations.filter((option) => option.routing.request.method === 'POST')) {
		const schema =
			contract.paths[pathFor(operation.routing.request)].post.requestBody.content[
				'application/json'
			].schema;
		const sent = properties.filter(
			(property) =>
				property.displayOptions?.show?.operation?.includes(operation.value) &&
				property.routing?.send?.type === 'body',
		);
		for (const property of sent) {
			const parts = property.routing.send.property.split('.');
			let field = schema;
			for (const part of parts) field = field?.properties?.[part];
			assert.ok(field, `Unsupported body field: ${property.name}`);
			if (field.enum)
				assert.deepEqual(
					property.options.map((option) => option.value).sort(),
					[...field.enum].sort(),
				);
		}
		for (const required of schema.required ?? []) {
			assert.ok(
				sent.some((property) => property.routing.send.property === required && property.required),
			);
		}
	}
	assert.equal(
		properties.find((property) => property.name === 'isLinkSharingEnabled').default,
		false,
	);
});

test('pagination and credential probe respect API bounds', () => {
	const parameters = contract.paths['/api/v1/studies'].get.parameters;
	const limitSchema = parameters.find((parameter) => parameter.name === 'limit').schema;
	const pagination = properties.find((property) => property.name === 'returnAll').routing.operations
		.pagination.properties;
	assert.equal(pagination.limitParameter, 'limit');
	assert.equal(pagination.offsetParameter, 'offset');
	assert.ok(pagination.pageSize <= limitSchema.maximum);
	assert.equal(
		properties.find((property) => property.name === 'limit').typeOptions.maxValue,
		limitSchema.maximum,
	);
	const probe = new MindsApi().test.request;
	assert.ok(contract.paths[`/api/v1${probe.url}`].get);
});

test('example workflows use supported operations and parameters, with no embedded credentials', async () => {
	const root = new URL('../examples/', import.meta.url);
	for (const filename of await readdir(root)) {
		const workflow = JSON.parse(await readFile(new URL(filename, root)));
		assert.equal(workflow.active, false);
		for (const node of workflow.nodes.filter((node) => node.type === 'n8n-nodes-minds.minds')) {
			assert.equal(node.parameters.resource, 'study');
			assert.ok(operations.some((operation) => operation.value === node.parameters.operation));
			assert.equal(node.credentials, undefined);
			for (const name of Object.keys(node.parameters))
				assert.ok(
					properties.some((property) => property.name === name),
					name,
				);
		}
	}
});
