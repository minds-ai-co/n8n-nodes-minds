import type { INodeProperties } from 'n8n-workflow';

const panelResource = {
	resource: ['panel'],
};

const createPanel = {
	operation: ['create'],
	resource: ['panel'],
};

const getPanel = {
	operation: ['get'],
	resource: ['panel'],
};

const getManyPanels = {
	operation: ['getAll'],
	resource: ['panel'],
};

const getPanelSummary = {
	operation: ['getSummary'],
	resource: ['panel'],
};

const previewResearchPlan = {
	operation: ['previewResearchPlan'],
	resource: ['panel'],
};

export const panelDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: panelResource },
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a panel',
				description: 'Create a Panel and optionally attach existing Groups',
				routing: {
					request: { method: 'POST', url: '/panels' },
					output: {
						postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }],
					},
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a panel',
				description: 'Get one Panel with its Groups, Minds, and messages',
				routing: {
					request: { method: 'GET', url: '=/panels/{{$parameter.panelId}}' },
					output: {
						postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }],
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many panels',
				description: 'List Panels available to the authenticated account',
				routing: {
					request: { method: 'GET', url: '/panels' },
					output: {
						postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }],
					},
				},
			},
			{
				name: 'Get Summary',
				value: 'getSummary',
				action: 'Get a panel summary',
				description: 'Get the persisted whole-study summary and semantic output blocks',
				routing: {
					request: {
						method: 'GET',
						url: '=/panels/{{$parameter.panelId}}/summary',
					},
					output: {
						postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }],
					},
				},
			},
			{
				name: 'Preview Research Plan',
				value: 'previewResearchPlan',
				action: 'Preview a panel research plan',
				description: 'Create or revise a saved research plan draft without running it',
				routing: {
					request: {
						method: 'POST',
						url: '=/panels/{{$parameter.panelId}}/research-plans/preview',
					},
					output: {
						postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }],
					},
				},
			},
		],
		default: 'getAll',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. Homepage positioning review',
		description: 'Name of the new Panel',
		displayOptions: { show: createPanel },
		routing: { send: { type: 'body', property: 'name' } },
	},
	{
		displayName: 'Group IDs',
		name: 'groupIds',
		type: 'string',
		default: '',
		placeholder: 'UUID, UUID',
		description: 'Comma-separated IDs of existing Minds Groups to attach',
		displayOptions: { show: createPanel },
		routing: {
			send: {
				type: 'body',
				property: 'groupIds',
				value:
					'={{ $value ? $value.split(",").map((id) => id.trim()).filter((id) => id.length > 0) : [] }}',
			},
		},
	},
	{
		displayName: 'Enable Link Sharing',
		name: 'isLinkSharingEnabled',
		type: 'boolean',
		default: false,
		description: 'Whether to enable public link sharing for the Panel and its attached Groups',
		displayOptions: { show: createPanel },
		routing: { send: { type: 'body', property: 'isLinkSharingEnabled' } },
	},
	{
		displayName: 'Panel ID',
		name: 'panelId',
		type: 'string',
		required: true,
		default: '',
		description: 'UUID of the existing Minds Panel',
		displayOptions: {
			show: {
				operation: ['get', 'getSummary', 'previewResearchPlan'],
				resource: ['panel'],
			},
		},
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: { show: getManyPanels },
		routing: {
			send: { paginate: '={{$value}}' },
			operations: {
				pagination: {
					type: 'offset',
					properties: {
						limitParameter: 'limit',
						offsetParameter: 'offset',
						pageSize: 100,
						type: 'query',
					},
				},
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 100 },
		default: 50,
		description: 'Max number of results to return',
		displayOptions: {
			show: {
				...getManyPanels,
				returnAll: [false],
			},
		},
		routing: {
			send: { type: 'query', property: 'limit' },
			output: { maxResults: '={{$value}}' },
		},
	},
	{
		displayName: 'Research Request',
		name: 'request',
		type: 'string',
		typeOptions: { rows: 5 },
		required: true,
		default: '',
		description: 'Planner-only objective and requested questions for the research draft',
		displayOptions: { show: previewResearchPlan },
		routing: { send: { type: 'body', property: 'request' } },
	},
	{
		displayName: 'Study Locale',
		name: 'studyLocale',
		type: 'options',
		options: [
			{ name: 'Arabic', value: 'ar' },
			{ name: 'Chinese', value: 'zh' },
			{ name: 'English', value: 'en' },
			{ name: 'French', value: 'fr' },
			{ name: 'German', value: 'de' },
			{ name: 'Japanese', value: 'ja' },
			{ name: 'Korean', value: 'ko' },
			{ name: 'Spanish', value: 'es' },
			{ name: 'Turkish', value: 'tr' },
		],
		default: 'en',
		description: 'Language used for the plan and eventual study output',
		displayOptions: { show: previewResearchPlan },
		routing: { send: { type: 'body', property: 'studyLocale' } },
	},
	{
		displayName: 'Source Kind',
		name: 'sourceKind',
		type: 'options',
		options: [
			{ name: 'Document', value: 'document' },
			{ name: 'Image', value: 'image' },
			{ name: 'Other', value: 'other' },
			{ name: 'Prompt', value: 'prompt' },
			{ name: 'Questionnaire', value: 'questionnaire' },
			{ name: 'Video', value: 'video' },
			{ name: 'Website', value: 'website' },
		],
		default: 'prompt',
		description: 'Type of respondent-visible source supplied to the plan',
		displayOptions: { show: previewResearchPlan },
		routing: {
			send: {
				type: 'body',
				property: 'source.kind',
				propertyInDotNotation: true,
			},
		},
	},
	{
		displayName: 'Source Label',
		name: 'sourceLabel',
		type: 'string',
		default: 'Research stimulus',
		description: 'Human-readable label for the source',
		displayOptions: { show: previewResearchPlan },
		routing: {
			send: {
				type: 'body',
				property: 'source.label',
				propertyInDotNotation: true,
			},
		},
	},
	{
		displayName: 'Source Content',
		name: 'sourceContent',
		type: 'string',
		typeOptions: { rows: 5 },
		default: '',
		description: 'Exact respondent-visible source text, separate from planner instructions',
		displayOptions: {
			show: {
				...previewResearchPlan,
				sourceKind: ['document', 'other', 'prompt', 'questionnaire'],
			},
		},
		routing: {
			send: {
				type: 'body',
				property: 'source.content',
				propertyInDotNotation: true,
			},
		},
	},
	{
		displayName: 'Source URL',
		name: 'sourceUrl',
		type: 'string',
		default: '',
		placeholder: 'https://example.com/research-source',
		description: 'Public HTTPS URL of the source',
		displayOptions: {
			show: {
				...previewResearchPlan,
				sourceKind: ['image', 'video', 'website'],
			},
		},
		routing: {
			send: {
				type: 'body',
				property: 'source.url',
				propertyInDotNotation: true,
			},
		},
	},
];

export const panelOperationDisplayOptions = {
	createPanel,
	getManyPanels,
	getPanel,
	getPanelSummary,
	previewResearchPlan,
};
