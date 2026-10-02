import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { studyDescription } from './resources/study';
import { legacyStudyOptionalFields } from './resources/study/legacy';

export class Minds implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Minds',
		name: 'minds',
		icon: { light: 'file:minds.svg', dark: 'file:minds.dark.svg' },
		group: ['transform'],
		version: [1, 1.1],
		defaultVersion: 1.1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Plan and inspect reviewable market research with Minds',
		defaults: {
			name: 'Minds',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'mindsApi', required: true }],
		requestDefaults: {
			baseURL: 'https://getminds.ai/api/v1',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [{ name: 'Study', value: 'study' }],
				default: 'study',
			},
			...studyDescription,
			...legacyStudyOptionalFields,
		],
	};
}
