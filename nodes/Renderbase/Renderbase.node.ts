import type {
  IExecuteFunctions,
  IDataObject,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  ILoadOptionsFunctions,
  INodePropertyOptions,
  IHttpRequestMethods,
} from 'n8n-workflow';

export class Rynko implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Rynko',
    name: 'rynko',
    icon: 'file:rynko.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Generate PDF and Excel documents from templates',
    defaults: {
      name: 'Rynko',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'rynkoApi',
        required: true,
      },
    ],
    properties: [
      // Resource
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Document',
            value: 'document',
          },
        ],
        default: 'document',
      },

      // Document Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['document'],
          },
        },
        options: [
          {
            name: 'Generate',
            value: 'generate',
            description: 'Generate a document from a template',
            action: 'Generate a document',
          },
          {
            name: 'Generate PDF',
            value: 'generatePdf',
            description: 'Generate a PDF document from a template',
            action: 'Generate a PDF',
          },
          {
            name: 'Generate Excel',
            value: 'generateExcel',
            description: 'Generate an Excel document from a template',
            action: 'Generate an Excel file',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get a document job by ID',
            action: 'Get a document job',
          },
          {
            name: 'Search',
            value: 'search',
            description: 'Search for document jobs',
            action: 'Search document jobs',
          },
        ],
        default: 'generate',
      },

      // ===================
      // Project Field (for all document generation)
      // ===================
      {
        displayName: 'Project',
        name: 'teamId',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getTeams',
        },
        required: true,
        displayOptions: {
          show: {
            resource: ['document'],
            operation: ['generate', 'generatePdf', 'generateExcel'],
          },
        },
        default: '',
        description: 'Select a project from your Rynko account',
      },

      // ===================
      // Environment Field (for all document generation)
      // ===================
      {
        displayName: 'Environment',
        name: 'workspaceId',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getWorkspaces',
          loadOptionsDependsOn: ['teamId'],
        },
        required: true,
        displayOptions: {
          show: {
            resource: ['document'],
            operation: ['generate', 'generatePdf', 'generateExcel'],
          },
        },
        default: '',
        description: 'Select an environment within the selected project',
      },

      // ===================
      // Template Field (for document generate)
      // ===================
      {
        displayName: 'Template',
        name: 'templateId',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getTemplates',
          loadOptionsDependsOn: ['workspaceId'],
        },
        required: true,
        displayOptions: {
          show: {
            resource: ['document'],
            operation: ['generate'],
          },
        },
        default: '',
        description: 'The template to use for document generation',
      },
      {
        displayName: 'PDF Template',
        name: 'templateId',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getPdfTemplates',
          loadOptionsDependsOn: ['workspaceId'],
        },
        required: true,
        displayOptions: {
          show: {
            resource: ['document'],
            operation: ['generatePdf'],
          },
        },
        default: '',
        description: 'The PDF template to use',
      },
      {
        displayName: 'Excel Template',
        name: 'templateId',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getExcelTemplates',
          loadOptionsDependsOn: ['workspaceId'],
        },
        required: true,
        displayOptions: {
          show: {
            resource: ['document'],
            operation: ['generateExcel'],
          },
        },
        default: '',
        description: 'The Excel template to use',
      },

      // Output Format (for generic generate)
      {
        displayName: 'Output Format',
        name: 'format',
        type: 'options',
        displayOptions: {
          show: {
            resource: ['document'],
            operation: ['generate'],
          },
        },
        options: [
          { name: 'PDF', value: 'pdf' },
          { name: 'Excel', value: 'excel' },
        ],
        default: 'pdf',
        description: 'The output format for the generated document',
      },

      // ===================
      // Get Document by ID
      // ===================
      {
        displayName: 'Job ID',
        name: 'jobId',
        type: 'string',
        required: true,
        displayOptions: {
          show: {
            resource: ['document'],
            operation: ['get'],
          },
        },
        default: '',
        description: 'The ID of the document job to retrieve',
      },

      // ===================
      // Search Filters
      // ===================
      {
        displayName: 'Search By',
        name: 'searchBy',
        type: 'options',
        displayOptions: {
          show: {
            resource: ['document'],
            operation: ['search'],
          },
        },
        options: [
          { name: 'Status', value: 'status' },
          { name: 'Template', value: 'templateId' },
          { name: 'Format', value: 'format' },
        ],
        default: 'status',
      },
      {
        displayName: 'Status',
        name: 'searchStatus',
        type: 'options',
        displayOptions: {
          show: {
            resource: ['document'],
            operation: ['search'],
            searchBy: ['status'],
          },
        },
        options: [
          { name: 'Pending', value: 'pending' },
          { name: 'Processing', value: 'processing' },
          { name: 'Completed', value: 'completed' },
          { name: 'Failed', value: 'failed' },
        ],
        default: 'completed',
      },
      {
        displayName: 'Template',
        name: 'searchTemplateId',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getTemplates',
        },
        displayOptions: {
          show: {
            resource: ['document'],
            operation: ['search'],
            searchBy: ['templateId'],
          },
        },
        default: '',
      },
      {
        displayName: 'Format',
        name: 'searchFormat',
        type: 'options',
        displayOptions: {
          show: {
            resource: ['document'],
            operation: ['search'],
            searchBy: ['format'],
          },
        },
        options: [
          { name: 'PDF', value: 'pdf' },
          { name: 'Excel', value: 'excel' },
        ],
        default: 'pdf',
      },

      // ===================
      // Additional Options
      // ===================
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        displayOptions: {
          show: {
            resource: ['document'],
            operation: ['generate', 'generatePdf', 'generateExcel'],
          },
        },
        options: [
          {
            displayName: 'File Name',
            name: 'fileName',
            type: 'string',
            default: '',
            description: 'Custom file name (without extension)',
          },
          {
            displayName: 'Wait for Completion',
            name: 'waitForCompletion',
            type: 'boolean',
            default: true,
            description: 'Whether to wait for the document to be generated before continuing',
          },
        ],
      },

      // ===================
      // Template Variables
      // ===================
      {
        displayName: 'Template Variables',
        name: 'variables',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        displayOptions: {
          show: {
            resource: ['document'],
            operation: ['generate', 'generatePdf', 'generateExcel'],
          },
        },
        default: {},
        placeholder: 'Add Variable',
        options: [
          {
            name: 'variableValues',
            displayName: 'Variable',
            values: [
              {
                displayName: 'Name',
                name: 'name',
                type: 'string',
                default: '',
              },
              {
                displayName: 'Value',
                name: 'value',
                type: 'string',
                default: '',
              },
            ],
          },
        ],
      },
    ],
  };

  methods = {
    loadOptions: {
      async getTeams(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const returnData: INodePropertyOptions[] = [];
        const credentials = await this.getCredentials('rynkoApi');
        const baseUrl = credentials.baseUrl as string || 'https://api.rynko.dev';

        try {
          const response = await this.helpers.requestWithAuthentication.call(this, 'rynkoApi', {
            method: 'GET' as IHttpRequestMethods,
            url: `${baseUrl}/api/v1/integration-api/teams`,
            json: true,
          });

          const teams = response || [];
          for (const team of teams) {
            returnData.push({
              name: team.name,
              value: team.id,
            });
          }
        } catch (error) {
          // Return empty if failed
        }

        return returnData;
      },

      async getWorkspaces(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const returnData: INodePropertyOptions[] = [];
        const credentials = await this.getCredentials('rynkoApi');
        const baseUrl = credentials.baseUrl as string || 'https://api.rynko.dev';
        const teamId = this.getCurrentNodeParameter('teamId') as string;

        if (!teamId) {
          return returnData;
        }

        try {
          const response = await this.helpers.requestWithAuthentication.call(this, 'rynkoApi', {
            method: 'GET' as IHttpRequestMethods,
            url: `${baseUrl}/api/v1/integration-api/workspaces`,
            qs: { teamId },
            json: true,
          });

          const workspaces = response || [];
          for (const workspace of workspaces) {
            returnData.push({
              name: workspace.name,
              value: workspace.id,
            });
          }
        } catch (error) {
          // Return empty if failed
        }

        return returnData;
      },

      async getTemplates(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const returnData: INodePropertyOptions[] = [];
        const credentials = await this.getCredentials('rynkoApi');
        const baseUrl = credentials.baseUrl as string || 'https://api.rynko.dev';
        const workspaceId = this.getCurrentNodeParameter('workspaceId') as string;

        if (!workspaceId) {
          return returnData;
        }

        try {
          const response = await this.helpers.requestWithAuthentication.call(this, 'rynkoApi', {
            method: 'GET' as IHttpRequestMethods,
            url: `${baseUrl}/api/v1/integration-api/templates`,
            qs: { workspaceId },
            json: true,
          });

          const templates = response || [];
          for (const template of templates) {
            returnData.push({
              name: `${template.name} (${template.workspaceName})`,
              value: template.shortId,
              description: template.description || '',
            });
          }
        } catch (error) {
          // Return empty if failed
        }

        return returnData;
      },

      async getPdfTemplates(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const returnData: INodePropertyOptions[] = [];
        const credentials = await this.getCredentials('rynkoApi');
        const baseUrl = credentials.baseUrl as string || 'https://api.rynko.dev';
        const workspaceId = this.getCurrentNodeParameter('workspaceId') as string;

        if (!workspaceId) {
          return returnData;
        }

        try {
          const response = await this.helpers.requestWithAuthentication.call(this, 'rynkoApi', {
            method: 'GET' as IHttpRequestMethods,
            url: `${baseUrl}/api/v1/integration-api/templates`,
            qs: { workspaceId },
            json: true,
          });

          const templates = response || [];
          // Filter to only show templates that support PDF output
          const pdfTemplates = templates.filter(
            (t: { outputFormats?: string[] }) => t.outputFormats && t.outputFormats.includes('pdf')
          );
          for (const template of pdfTemplates) {
            returnData.push({
              name: `${template.name} (${template.workspaceName})`,
              value: template.shortId,
              description: template.description || '',
            });
          }
        } catch (error) {
          // Return empty if failed
        }

        return returnData;
      },

      async getExcelTemplates(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const returnData: INodePropertyOptions[] = [];
        const credentials = await this.getCredentials('rynkoApi');
        const baseUrl = credentials.baseUrl as string || 'https://api.rynko.dev';
        const workspaceId = this.getCurrentNodeParameter('workspaceId') as string;

        if (!workspaceId) {
          return returnData;
        }

        try {
          const response = await this.helpers.requestWithAuthentication.call(this, 'rynkoApi', {
            method: 'GET' as IHttpRequestMethods,
            url: `${baseUrl}/api/v1/integration-api/templates`,
            qs: { workspaceId },
            json: true,
          });

          const templates = response || [];
          // Filter to only show templates that support Excel output
          const excelTemplates = templates.filter(
            (t: { outputFormats?: string[] }) => t.outputFormats && t.outputFormats.includes('excel')
          );
          for (const template of excelTemplates) {
            returnData.push({
              name: `${template.name} (${template.workspaceName})`,
              value: template.shortId,
              description: template.description || '',
            });
          }
        } catch (error) {
          // Return empty if failed
        }

        return returnData;
      },
    },
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;
    const credentials = await this.getCredentials('rynkoApi');
    const baseUrl = credentials.baseUrl as string || 'https://api.rynko.dev';

    for (let i = 0; i < items.length; i++) {
      try {
        let responseData: IDataObject;

        if (resource === 'document') {
          if (operation === 'generate') {
            responseData = await Rynko.prototype.generateDocument.call(this, i, baseUrl);
          } else if (operation === 'generatePdf') {
            responseData = await Rynko.prototype.generateDocument.call(this, i, baseUrl, 'pdf');
          } else if (operation === 'generateExcel') {
            responseData = await Rynko.prototype.generateDocument.call(this, i, baseUrl, 'excel');
          } else if (operation === 'get') {
            responseData = await Rynko.prototype.getDocument.call(this, i, baseUrl);
          } else if (operation === 'search') {
            responseData = await Rynko.prototype.searchDocuments.call(this, i, baseUrl);
          } else {
            throw new Error(`Unknown operation: ${operation}`);
          }
        } else {
          throw new Error(`Unknown resource: ${resource}`);
        }

        returnData.push({ json: responseData });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: (error as Error).message } });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }

  private async generateDocument(this: IExecuteFunctions, itemIndex: number, baseUrl: string, format?: string): Promise<IDataObject> {
    const templateId = this.getNodeParameter('templateId', itemIndex) as string;
    const teamId = this.getNodeParameter('teamId', itemIndex) as string;
    const workspaceId = this.getNodeParameter('workspaceId', itemIndex) as string;
    const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;
    const variablesCollection = this.getNodeParameter('variables', itemIndex, {}) as IDataObject;

    const body: IDataObject = {
      templateId,
      teamId,
      workspaceId,
    };

    // Set format
    if (format) {
      body.format = format;
    } else {
      body.format = this.getNodeParameter('format', itemIndex) as string;
    }

    // Optional fields
    if (options.fileName) body.fileName = options.fileName;
    if (options.waitForCompletion !== undefined) body.waitForCompletion = options.waitForCompletion;

    // Process variables
    const variableValues = (variablesCollection as IDataObject).variableValues as IDataObject[] || [];
    if (variableValues.length > 0) {
      const variables: IDataObject = {};
      for (const v of variableValues) {
        variables[v.name as string] = v.value;
      }
      body.variables = variables;
    }

    const response = await this.helpers.requestWithAuthentication.call(this, 'rynkoApi', {
      method: 'POST' as IHttpRequestMethods,
      url: `${baseUrl}/api/v1/documents/generate`,
      body,
      json: true,
    });

    return response.data || response;
  }

  private async getDocument(this: IExecuteFunctions, itemIndex: number, baseUrl: string): Promise<IDataObject> {
    const jobId = this.getNodeParameter('jobId', itemIndex) as string;

    const response = await this.helpers.requestWithAuthentication.call(this, 'rynkoApi', {
      method: 'GET' as IHttpRequestMethods,
      url: `${baseUrl}/api/v1/documents/${jobId}`,
      json: true,
    });

    return response.data || response;
  }

  private async searchDocuments(this: IExecuteFunctions, itemIndex: number, baseUrl: string): Promise<IDataObject> {
    const searchBy = this.getNodeParameter('searchBy', itemIndex) as string;
    const qs: IDataObject = { limit: 10 };

    if (searchBy === 'status') {
      qs.status = this.getNodeParameter('searchStatus', itemIndex) as string;
    } else if (searchBy === 'templateId') {
      qs.templateId = this.getNodeParameter('searchTemplateId', itemIndex) as string;
    } else if (searchBy === 'format') {
      qs.format = this.getNodeParameter('searchFormat', itemIndex) as string;
    }

    const response = await this.helpers.requestWithAuthentication.call(this, 'rynkoApi', {
      method: 'GET' as IHttpRequestMethods,
      url: `${baseUrl}/api/v1/documents`,
      qs,
      json: true,
    });

    return response;
  }
}
