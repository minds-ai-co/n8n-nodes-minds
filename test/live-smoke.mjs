// Opt-in API smoke check; development-only, excluded from the published package.
// Creates one empty Study and a plan draft, but never starts research or deletes data.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { Expression, NodeHelpers } = require('n8n-workflow');
const { Minds } = require('../dist/nodes/Minds/Minds.node.js');
const { MindsApi } = require('../dist/credentials/MindsApi.credentials.js');
const key = process.env.MINDS_API_KEY;
if (!key) throw new Error('Inject MINDS_API_KEY through your credential manager');
const description = new Minds().description;
const properties = description.properties;
const operations = properties.find((property) => property.name === 'operation').options;
const expression = new Expression('UTC');
const name = `n8n verification ${new Date().toISOString().slice(0, 10)}`;

async function call(operationValue, overrides = {}) {
	const operation = operations.find((option) => option.value === operationValue);
	const parameters = Object.fromEntries(
		properties.map((property) => [property.name, property.default]),
	);
	Object.assign(parameters, { resource: 'study', operation: operationValue }, overrides);
	const evaluate = (value, currentValue) =>
		expression.resolveSimpleParameterValue(value, { $parameter: parameters, $value: currentValue });
	const url = new URL(
		description.requestDefaults.baseURL + evaluate(operation.routing.request.url),
	);
	const body = {};
	const typeVersion = 1.1;
	function sendFields(fields, values) {
		for (const property of fields) {
			if (!NodeHelpers.displayParameter(values, property, { typeVersion }, description, parameters))
				continue;
			if (property.type === 'collection') {
				const selected = values[property.name] ?? {};
				sendFields(
					property.options.filter((option) => Object.hasOwn(selected, option.name)),
					selected,
				);
				continue;
			}
			const send = property.routing?.send;
			if (!send || !['body', 'query'].includes(send.type)) continue;
			const value =
				send.value === undefined
					? values[property.name]
					: evaluate(send.value, values[property.name]);
			if (send.type === 'query') url.searchParams.set(send.property, String(value));
			else if (send.propertyInDotNotation) {
				const [parent, child] = send.property.split('.');
				(body[parent] ??= {})[child] = value;
			} else body[send.property] = value;
		}
	}
	sendFields(properties, parameters);
	const authorization = expression.resolveSimpleParameterValue(
		new MindsApi().authenticate.properties.headers.Authorization,
		{ $credentials: { apiKey: key } },
	);
	const response = await fetch(url, {
		method: operation.routing.request.method,
		headers: { ...description.requestDefaults.headers, Authorization: authorization },
		...(operation.routing.request.method === 'POST' ? { body: JSON.stringify(body) } : {}),
		signal: AbortSignal.timeout(180000),
	});
	// Never emit response bodies, private research content, IDs, or credentials.
	assert.ok(response.ok, `${operationValue} returned HTTP ${response.status}`);
	const payload = await response.json();
	assert.ok(Object.hasOwn(payload, 'data'), `${operationValue} missing data envelope`);
	console.log(`${operationValue}: HTTP ${response.status}; data envelope verified`);
	return payload.data;
}

try {
	const studies = await call('getAll', { limit: 100 });
	assert.ok(Array.isArray(studies));
	let study = studies.find((study) => study.name === name);
	if (!study)
		study = await call('create', {
			name,
			additionalFields: { audienceIds: '', isLinkSharingEnabled: false },
		});
	else console.log("create: reusing this date's verification Study");
	assert.equal(typeof study.id, 'string');
	await call('get', { studyId: study.id });
	await call('getSummary', { studyId: study.id });
	await call('previewResearchPlan', {
		studyId: study.id,
		request:
			'Draft exactly two open-ended questions about clarity and credibility of this concept. Do not execute research.',
		sourceKind: 'prompt',
		additionalFields: { sourceLabel: 'Verification concept', studyLocale: 'en' },
		sourceContent: 'A reusable water bottle with a replaceable filter for commuters.',
	});
	console.log(
		'PASS: all five operation API contracts exercised using compiled node expressions. This is an API smoke check, not a full n8n UI execution.',
	);
} catch (error) {
	// Avoid framework exceptions that might contain request metadata.
	console.error(
		error instanceof assert.AssertionError
			? error.message
			: 'Live smoke check failed; inspect privately without logging credentials or payloads',
	);
	process.exitCode = 1;
}
