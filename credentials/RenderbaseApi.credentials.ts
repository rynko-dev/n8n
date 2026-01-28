import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class RynkoApi implements ICredentialType {
  name = 'rynkoApi';
  displayName = 'Rynko API';
  documentationUrl = 'https://docs.rynko.dev/integrations/no-code#n8n-integration';

  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'Your Rynko API key. Generate one from Settings → API Keys in your Rynko dashboard.',
    },
    {
      displayName: 'API Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://api.rynko.dev',
      description: 'The base URL for the Rynko API',
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
      baseURL: '={{$credentials.baseUrl}}',
      url: '/api/v1/auth/verify',
    },
  };
}
