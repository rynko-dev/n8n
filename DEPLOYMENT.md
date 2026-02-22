# Rynko n8n Integration - Deployment Guide

This guide covers deploying the Rynko n8n community node package.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Building the Package](#building-the-package)
4. [Installing in n8n](#installing-in-n8n)
5. [API Key Configuration](#api-key-configuration)
6. [Publishing to npm](#publishing-to-npm)
7. [n8n Community Submission](#n8n-community-submission)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

- Node.js 18.x or higher
- npm 8.x or higher
- n8n instance (self-hosted or n8n.cloud)
- TypeScript knowledge for modifications

### Backend Requirements

The Rynko backend must have:
- API Key authentication enabled
- **Integration API module deployed** (`/api/v1/integration-api/*` endpoints) - Required for project/environment/template cascading selection
- Webhook subscriptions module deployed
- SSL certificate (HTTPS required)

---

## Cascading Project/Environment/Template Selection

The Rynko n8n node implements cascading dropdown selection for Project → Environment → Template. This ensures users can only select templates from environments they have access to.

### How It Works

1. **Project Dropdown**: Lists all projects the user has access to via the Integration API
2. **Environment Dropdown**: Filters environments based on the selected project
3. **Template Dropdown**: Filters templates based on the selected environment and document type

### Implementation Details

The node uses n8n's `loadOptions` methods with `loadOptionsDependsOn` to create the cascading behavior:

```typescript
// Project dropdown - no dependencies
{
  displayName: 'Project',
  name: 'teamId',
  type: 'options',
  typeOptions: {
    loadOptionsMethod: 'getTeams',
  },
}

// Environment dropdown - depends on teamId
{
  displayName: 'Environment',
  name: 'workspaceId',
  type: 'options',
  typeOptions: {
    loadOptionsMethod: 'getWorkspaces',
    loadOptionsDependsOn: ['teamId'],
  },
}

// Template dropdown - depends on workspaceId
{
  displayName: 'Template',
  name: 'templateId',
  type: 'options',
  typeOptions: {
    loadOptionsMethod: 'getTemplates',  // or getPdfTemplates, getExcelTemplates
    loadOptionsDependsOn: ['workspaceId'],
  },
}
```

### API Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `GET /api/v1/integration-api/teams` | List projects for dropdown |
| `GET /api/v1/integration-api/workspaces?teamId={id}` | List environments filtered by project |
| `GET /api/v1/integration-api/templates?workspaceId={id}&type={pdf\|excel}` | List templates filtered by environment and type |

---

## Local Development Setup

### 1. Clone and Install

```bash
cd integrations/n8n-rynko
npm install
```

### 2. Build the Package

```bash
npm run build
```

This compiles TypeScript to JavaScript and copies icons.

### 3. Link for Local Development

```bash
# In n8n-rynko directory
npm link

# In your n8n installation directory
npm link n8n-nodes-rynko
```

### 4. Start n8n in Development Mode

```bash
# Start n8n with the linked package
n8n start
```

---

## Building the Package

### Development Build

```bash
npm run build
```

### Watch Mode (for development)

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run lint
```

### Output Structure

After building:
```
dist/
├── credentials/
│   └── RynkoApi.credentials.js
└── nodes/
    └── Rynko/
        ├── Rynko.node.js
        ├── RynkoTrigger.node.js
        └── rynko.svg
```

---

## Installing in n8n

### Option 1: Community Nodes (n8n.cloud or Self-hosted)

1. Go to **Settings** → **Community Nodes**
2. Click **Install a community node**
3. Enter: `n8n-nodes-rynko`
4. Click **Install**

### Option 2: Manual Installation (Self-hosted)

```bash
# In your n8n installation
cd ~/.n8n

# Install the package
npm install n8n-nodes-rynko

# Restart n8n
n8n start
```

### Option 3: Docker Installation

Add to your Dockerfile:

```dockerfile
FROM n8nio/n8n

USER root
RUN cd /usr/local/lib/node_modules/n8n && npm install n8n-nodes-rynko
USER node
```

Or use environment variable:

```yaml
# docker-compose.yml
services:
  n8n:
    image: n8nio/n8n
    environment:
      - N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true
      - EXTRA_NODE_MODULES=n8n-nodes-rynko
```

---

## API Key Configuration

### 1. Generate API Key in Rynko

1. Log in to your Rynko dashboard at https://app.rynko.dev
2. Go to **Settings** → **API Keys**
3. Click **Create New API Key**
4. Give it a descriptive name (e.g., "n8n Integration")
5. Copy the generated API key (it will only be shown once)

### 2. Configure Credentials in n8n

1. In n8n, go to **Credentials** → **New**
2. Search for "Rynko API"
3. Enter:
   - **API Key:** Your Rynko API key
   - **API Base URL:** `https://api.rynko.dev` (default, change if self-hosted)
4. Click **Save**

### 3. Webhook URL Configuration

For triggers, ensure your n8n instance is accessible from the internet:
- Self-hosted: Configure `WEBHOOK_URL` environment variable
- n8n.cloud: Webhooks work automatically

```bash
# Self-hosted example
export WEBHOOK_URL=https://your-n8n-domain.com/
```

---

## Publishing to npm

### 1. Update Package Version

```bash
npm version patch  # or minor, major
```

### 2. Build and Test

```bash
npm run build
npm run lint
```

### 3. Publish

```bash
npm login
npm publish
```

### 4. Verify Publication

```bash
npm view n8n-nodes-rynko
```

---

## n8n Community Submission

### 1. Requirements for Community Listing

- [ ] Package published on npm
- [ ] Source code on GitHub
- [ ] README with clear documentation
- [ ] License file (MIT recommended)
- [ ] Working example workflows
- [ ] All operations tested

### 2. Submit to n8n Community

1. Fork [n8n-io/n8n](https://github.com/n8n-io/n8n)
2. Add your package to community nodes list
3. Submit pull request

### 3. Community Node Guidelines

- Follow n8n coding standards
- Include proper error handling
- Add meaningful descriptions
- Test on multiple n8n versions

---

## Troubleshooting

### Common Issues

**Node Not Appearing**
- Restart n8n after installation
- Check n8n logs for errors
- Verify package is in node_modules

**API Key Authentication Fails**
- Verify API key is correct and active
- Check if the API key has the required permissions
- Ensure the API base URL is correct

**Webhook Triggers Not Working**
- Verify n8n is accessible from internet
- Check WEBHOOK_URL is configured
- Verify webhook subscription created in Rynko

**TypeScript Build Errors**
- Run `npm install` to update dependencies
- Check TypeScript version compatibility
- Verify n8n-workflow peer dependency

**Cascading Dropdowns Not Loading**
- Verify Integration API module is deployed on backend
- Check `/api/v1/integration-api/teams` returns data with API key auth
- Ensure API key has correct permissions
- Check n8n logs for API errors during dropdown load

**Environment Dropdown Empty After Project Selection**
- Verify the `loadOptionsDependsOn: ['teamId']` is configured
- Check that the project has environments created
- Verify API key has access to the selected project's environments

**Template Dropdown Shows Wrong Templates**
- Verify environment filtering is working correctly
- Check that templates exist in the selected environment
- For PDF/Excel specific dropdowns, verify the type filter is applied

### Debug Mode

Enable debug logging:

```bash
export N8N_LOG_LEVEL=debug
n8n start
```

### Getting Help

- **n8n Community Forum:** https://community.n8n.io
- **n8n Documentation:** https://docs.n8n.io
- **Rynko Support:** support@rynko.dev

---

## Quick Reference

### Package Structure

```
n8n-rynko/
├── package.json           # Package configuration
├── tsconfig.json          # TypeScript config
├── gulpfile.js            # Build icons task
├── index.ts               # Package exports
├── DEPLOYMENT.md          # This guide
├── README.md              # Documentation
├── credentials/
│   └── RynkoApi.credentials.ts
└── nodes/
    └── Rynko/
        ├── Rynko.node.ts        # Action node (with cascading loadOptions)
        ├── RynkoTrigger.node.ts # Trigger node
        └── rynko.svg            # Icon
```

### Key Node Methods

The `Rynko.node.ts` implements these loadOptions methods for cascading selection:

| Method | Purpose | Dependencies |
|--------|---------|--------------|
| `getTeams` | List projects for dropdown | None |
| `getWorkspaces` | List environments filtered by project | `teamId` |
| `getTemplates` | List all templates in environment | `workspaceId` |
| `getPdfTemplates` | List PDF templates in environment | `workspaceId` |
| `getExcelTemplates` | List Excel templates in environment | `workspaceId` |

### npm Commands

```bash
npm install      # Install dependencies
npm run build    # Build package
npm run dev      # Watch mode
npm run lint     # Check code
npm publish      # Publish to npm
```

### n8n Environment Variables

| Variable | Description |
|----------|-------------|
| `WEBHOOK_URL` | Base URL for webhooks |
| `N8N_LOG_LEVEL` | Logging level (debug, info, warn, error) |
| `EXTRA_NODE_MODULES` | Additional community nodes to load |
