import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class MindsApi implements ICredentialType {
	name = 'mindsApi';

	displayName = 'Minds API';

	icon = 'file:../nodes/Minds/minds.svg' as const;

	documentationUrl =
		'https://github.com/minds-ai-co/n8n-nodes-minds?tab=readme-ov-file#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description: 'Minds API key created under Settings, API Keys',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://getminds.ai/api/v1',
			url: '/panels',
			method: 'GET',
			qs: { limit: 1, offset: 0 },
		},
	};
}
