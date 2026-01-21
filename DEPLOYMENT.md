# Renderbase n8n Integration - Deployment Guide

This guide covers deploying the Renderbase n8n community node package.

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

The Renderbase backend must have:
- API Key authentication enabled
- Webhook subscriptions module deployed
- SSL certificate (HTTPS required)

---

## Local Development Setup

### 1. Clone and Install

```bash
cd integrations/n8n-renderbase
npm install
```

### 2. Build the Package

```bash
npm run build
```

This compiles TypeScript to JavaScript and copies icons.

### 3. Link for Local Development

```bash
# In n8n-renderbase directory
npm link

# In your n8n installation directory
npm link n8n-nodes-renderbase
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
│   └── RenderbaseApi.credentials.js
└── nodes/
    └── Renderbase/
        ├── Renderbase.node.js
        ├── RenderbaseTrigger.node.js
        └── renderbase.svg
```

---

## Installing in n8n

### Option 1: Community Nodes (n8n.cloud or Self-hosted)

1. Go to **Settings** → **Community Nodes**
2. Click **Install a community node**
3. Enter: `n8n-nodes-renderbase`
4. Click **Install**

### Option 2: Manual Installation (Self-hosted)

```bash
# In your n8n installation
cd ~/.n8n

# Install the package
npm install n8n-nodes-renderbase

# Restart n8n
n8n start
```

### Option 3: Docker Installation

Add to your Dockerfile:

```dockerfile
FROM n8nio/n8n

USER root
RUN cd /usr/local/lib/node_modules/n8n && npm install n8n-nodes-renderbase
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
      - EXTRA_NODE_MODULES=n8n-nodes-renderbase
```

---

## API Key Configuration

### 1. Generate API Key in Renderbase

1. Log in to your Renderbase dashboard at https://app.renderbase.dev
2. Go to **Settings** → **API Keys**
3. Click **Create New API Key**
4. Give it a descriptive name (e.g., "n8n Integration")
5. Copy the generated API key (it will only be shown once)

### 2. Configure Credentials in n8n

1. In n8n, go to **Credentials** → **New**
2. Search for "Renderbase API"
3. Enter:
   - **API Key:** Your Renderbase API key
   - **API Base URL:** `https://api.renderbase.dev` (default, change if self-hosted)
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
npm view n8n-nodes-renderbase
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
- Verify webhook subscription created in Renderbase

**TypeScript Build Errors**
- Run `npm install` to update dependencies
- Check TypeScript version compatibility
- Verify n8n-workflow peer dependency

### Debug Mode

Enable debug logging:

```bash
export N8N_LOG_LEVEL=debug
n8n start
```

### Getting Help

- **n8n Community Forum:** https://community.n8n.io
- **n8n Documentation:** https://docs.n8n.io
- **Renderbase Support:** support@renderbase.dev

---

## Quick Reference

### Package Structure

```
n8n-renderbase/
├── package.json           # Package configuration
├── tsconfig.json          # TypeScript config
├── gulpfile.js            # Build icons task
├── index.ts               # Package exports
├── DEPLOYMENT.md          # This guide
├── README.md              # Documentation
├── credentials/
│   └── RenderbaseApi.credentials.ts
└── nodes/
    └── Renderbase/
        ├── Renderbase.node.ts        # Action node
        ├── RenderbaseTrigger.node.ts # Trigger node
        └── renderbase.svg            # Icon
```

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
