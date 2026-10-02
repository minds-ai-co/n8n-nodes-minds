import type { INodeProperties } from 'n8n-workflow';

// Version 1 retains its stored parameter paths for existing workflows.
const createStudy = { operation: ['create'], resource: ['study'] };
const previewResearchPlan = { operation: ['previewResearchPlan'], resource: ['study'] };

export const legacyStudyOptionalFields: INodeProperties[] = [
	{
		displayName: 'Audience IDs',
		name: 'audienceIds',
		type: 'string',
		default: '',
		placeholder: 'UUID, UUID',
		description: 'Comma-separated IDs of existing Minds Audiences to attach',
		displayOptions: { show: { ...createStudy, '@version': [1] } },
		routing: {
			send: {
				type: 'body',
				property: 'audienceIds',
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
		description: 'Whether to enable public link sharing for the Study and its attached Audiences',
		displayOptions: { show: { ...createStudy, '@version': [1] } },
		routing: { send: { type: 'body', property: 'isLinkSharingEnabled' } },
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
		displayOptions: { show: { ...previewResearchPlan, '@version': [1] } },
		routing: { send: { type: 'body', property: 'studyLocale' } },
	},
	{
		displayName: 'Source Label',
		name: 'sourceLabel',
		type: 'string',
		default: 'Research stimulus',
		description: 'Human-readable label for the source',
		displayOptions: { show: { ...previewResearchPlan, '@version': [1] } },
		routing: {
			send: {
				type: 'body',
				property: 'source.label',
				propertyInDotNotation: true,
			},
		},
	},
];
