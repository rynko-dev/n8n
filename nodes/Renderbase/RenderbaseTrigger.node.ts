import type {
  IHookFunctions,
  IWebhookFunctions,
  IDataObject,
  INodeType,
  INodeTypeDescription,
  IWebhookResponseData,
  IHttpRequestMethods,
} from 'n8n-workflow';

export class RynkoTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Rynko Trigger',
    name: 'rynkoTrigger',
    icon: 'file:rynko.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["event"]}}',
    description: 'Starts the workflow when Rynko events occur',
    defaults: {
      name: 'Rynko Trigger',
    },
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'rynkoApi',
        required: true,
      },
    ],
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        path: 'webhook',
      },
    ],
    properties: [
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        noDataExpression: true,
        required: true,
        default: 'document.completed',
        options: [
          {
            name: 'Document Completed',
            value: 'document.completed',
            description: 'Triggers when a document is successfully generated',
          },
          {
            name: 'Document Failed',
            value: 'document.failed',
            description: 'Triggers when a document generation fails',
          },
        ],
      },
    ],
  };

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        const webhookUrl = this.getNodeWebhookUrl('default');
        const webhookData = this.getWorkflowStaticData('node');
        const event = this.getNodeParameter('event') as string;
        const credentials = await this.getCredentials('rynkoApi');
        const baseUrl = credentials.baseUrl as string || 'https://api.rynko.dev';

        // Check if we have a stored webhook ID
        if (webhookData.webhookId) {
          try {
            await this.helpers.requestWithAuthentication.call(this, 'rynkoApi', {
              method: 'GET' as IHttpRequestMethods,
              url: `${baseUrl}/api/v1/webhook-subscriptions/${webhookData.webhookId}`,
              json: true,
            });
            return true;
          } catch (error) {
            // Webhook doesn't exist anymore
            delete webhookData.webhookId;
            return false;
          }
        }

        // List webhooks and check if one exists with our URL
        try {
          const response = await this.helpers.requestWithAuthentication.call(this, 'rynkoApi', {
            method: 'GET' as IHttpRequestMethods,
            url: `${baseUrl}/api/v1/webhook-subscriptions`,
            json: true,
          });

          const webhooks = response.data || [];
          const existingWebhook = webhooks.find(
            (w: IDataObject) => w.url === webhookUrl && (w.events as string[])?.includes(event)
          );

          if (existingWebhook) {
            webhookData.webhookId = existingWebhook.id;
            return true;
          }
        } catch (error) {
          // Ignore errors
        }

        return false;
      },

      async create(this: IHookFunctions): Promise<boolean> {
        const webhookUrl = this.getNodeWebhookUrl('default');
        const webhookData = this.getWorkflowStaticData('node');
        const event = this.getNodeParameter('event') as string;
        const credentials = await this.getCredentials('rynkoApi');
        const baseUrl = credentials.baseUrl as string || 'https://api.rynko.dev';

        const body: IDataObject = {
          url: webhookUrl,
          events: [event],
          name: `n8n - ${event}`,
        };

        try {
          const response = await this.helpers.requestWithAuthentication.call(this, 'rynkoApi', {
            method: 'POST' as IHttpRequestMethods,
            url: `${baseUrl}/api/v1/webhook-subscriptions`,
            body,
            json: true,
          });

          webhookData.webhookId = response.data.id;
          return true;
        } catch (error) {
          return false;
        }
      },

      async delete(this: IHookFunctions): Promise<boolean> {
        const webhookData = this.getWorkflowStaticData('node');
        const credentials = await this.getCredentials('rynkoApi');
        const baseUrl = credentials.baseUrl as string || 'https://api.rynko.dev';

        if (webhookData.webhookId) {
          try {
            await this.helpers.requestWithAuthentication.call(this, 'rynkoApi', {
              method: 'DELETE' as IHttpRequestMethods,
              url: `${baseUrl}/api/v1/webhook-subscriptions/${webhookData.webhookId}`,
              json: true,
            });
          } catch (error) {
            // Ignore errors during deletion
          }
          delete webhookData.webhookId;
        }

        return true;
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const bodyData = this.getBodyData();

    return {
      workflowData: [this.helpers.returnJsonArray(bodyData)],
    };
  }
}
