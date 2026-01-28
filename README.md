# Rynko n8n Community Node

Official n8n community node for Rynko - the document generation platform with unified template design for PDF and Excel documents.

## Features

### Trigger Node: Rynko Trigger

Starts workflows when document events occur:
- **Document Completed** - When a document is successfully generated
- **Document Failed** - When document generation fails
- **Batch Completed** - When a batch generation completes

### Action Node: Rynko

Perform document generation operations:
- **Generate PDF** - Generate a PDF document from a template
- **Generate Excel** - Generate an Excel document from a template
- **Generate Batch** - Generate multiple documents from a single template
- **Get Job** - Get document job details by ID
- **List Jobs** - List document jobs with filters

## Installation

### n8n Community Nodes

1. Go to **Settings** → **Community Nodes**
2. Click **Install a community node**
3. Enter: `n8n-nodes-rynko`
4. Click **Install**

### Manual Installation

```bash
npm install n8n-nodes-rynko
```

## Configuration

### 1. Generate API Key

Generate an API key in your Rynko dashboard:
1. Log in to https://app.rynko.dev
2. Go to **Settings** → **API Keys**
3. Click **Create New API Key**
4. Copy the generated key

### 2. Add Credentials in n8n

1. Go to **Credentials** → **New**
2. Search for "Rynko API"
3. Enter your API Key
4. Click **Save**

## Usage Examples

### Generate a PDF Document

1. Add **Rynko** node
2. Select operation: **Generate PDF**
3. Choose template from dropdown
4. Add template variables (optional)
5. Optionally specify workspace ID

### Generate Excel Report

1. Add **Rynko** node
2. Select operation: **Generate Excel**
3. Choose template from dropdown
4. Add template variables
5. Configure output options

### Trigger on Document Completion

1. Add **Rynko Trigger** node
2. Select event: **Document Completed**
3. Connect to your workflow
4. Activate workflow

### Generate Batch Documents

1. Add **Rynko** node
2. Select operation: **Generate Batch**
3. Choose template
4. Provide array of documents with variables
5. Each document in the batch can have different variable values

## Project Structure

```
n8n-rynko/
├── credentials/
│   └── RynkoApi.credentials.ts
├── nodes/
│   └── Rynko/
│       ├── Rynko.node.ts
│       ├── RynkoTrigger.node.ts
│       └── rynko.svg
├── package.json
├── tsconfig.json
├── DEPLOYMENT.md
└── README.md
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Lint
npm run lint
```

## Authentication

Uses API Key authentication with the `Authorization: Bearer` header.

Your API key provides access to:
- Generate documents (PDF and Excel)
- Read document job status
- Access templates
- Manage webhook subscriptions

## API Endpoints Used

- `POST /api/v1/documents/generate` - Generate single document
- `POST /api/v1/documents/generate/batch` - Generate batch documents
- `GET /api/v1/documents/jobs` - List/search document jobs
- `GET /api/v1/documents/jobs/:id` - Get document job details
- `GET /api/v1/templates` - List templates
- `POST /api/v1/webhook-subscriptions` - Subscribe to webhooks
- `DELETE /api/v1/webhook-subscriptions/:id` - Unsubscribe

## Workspace Support

When generating documents, you can optionally specify a `workspaceId` to generate documents in a specific workspace. If not provided, documents are generated in the user's current workspace.

## Documentation

- [Deployment Guide](./DEPLOYMENT.md)
- [n8n Community Nodes](https://docs.n8n.io/integrations/community-nodes/)
- [Rynko API Documentation](https://docs.rynko.dev/api)

## Support

- Email: support@rynko.dev
- Documentation: https://docs.rynko.dev
- n8n Community: https://community.n8n.io

## License

MIT
