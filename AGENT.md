# AGENT.md — bunq API CLI for AI Agents

This document explains how to use the bunq API CLI as an AI agent.

## Overview

The `bunqcom` CLI provides access to the bunq API API.

## Prerequisites

```bash
bunqcom config set --api-key <key>
```

## All Commands

### Config

```bash
bunqcom config set --api-key <key>
bunqcom config set --base-url <url>
bunqcom config show
```

### API Calls

```bash
bunqcom call            # Make API call
bunqcom call --json     # JSON output for parsing
```

## Tips for Agents

1. Always use `--json` when parsing results programmatically
2. Check `bunqcom --help` for all available commands
3. Configure API key before making calls
