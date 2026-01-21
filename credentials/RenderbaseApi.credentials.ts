import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class RenderbaseApi implements ICredentialType {
  name = 'renderbaseApi';
  displayName = 'Renderbase API';
  documentationUrl = 'https://docs.renderbase.dev/integrations/no-code#n8n-integration';

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
      description: 'Your Renderbase API key. Generate one from Settings → API Keys in your Renderbase dashboard.',
    },
    {
      displayName: 'API Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://api.renderbase.dev',
      description: 'The base URL for the Renderbase API',
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
