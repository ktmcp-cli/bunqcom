![Banner](https://raw.githubusercontent.com/ktmcp-cli/bunqcom/main/banner.svg)

> "Six months ago, everyone was talking about MCPs. And I was like, screw MCPs. Every MCP would be better as a CLI."
>
> — [Peter Steinberger](https://twitter.com/steipete), Founder of OpenClaw
> [Watch on YouTube (~2:39:00)](https://www.youtube.com/@lexfridman) | [Lex Fridman Podcast #491](https://lexfridman.com/peter-steinberger/)

# bunq API CLI

> **⚠️ Unofficial CLI** - Not officially sponsored or affiliated with bunq API.

A production-ready command-line interface for bunq API — ***UPDATE:*** *We have released a [beta version of the new bunq API documentation.](https://beta.doc.bunq.com)*

***NOTICE:***  *We have updated the sandbox base url to `https://public-api.sandbox.bun

## Features

- **Full API Access** — All endpoints accessible via CLI
- **JSON output** — All commands support `--json` for scripting
- **Colorized output** — Clean terminal output with chalk
- **Configuration management** — Store API keys securely

## Installation

```bash
npm install -g @ktmcp-cli/bunqcom
```

## Quick Start

```bash
# Configure API key
bunqcom config set --api-key YOUR_API_KEY

# Make an API call
bunqcom call

# Get help
bunqcom --help
```

## Commands

### Config

```bash
bunqcom config set --api-key <key>
bunqcom config set --base-url <url>
bunqcom config show
```

### API Calls

```bash
bunqcom call            # Make API call
bunqcom call --json     # JSON output
```

## JSON Output

All commands support `--json` for structured output.

## API Documentation

Base URL: `https://public-api.sandbox.bunq.com/{basePath}`

For full API documentation, visit the official docs.

## Why CLI > MCP?

No server to run. No protocol overhead. Just install and go.

- **Simpler** — Just a binary you call directly
- **Composable** — Pipe to `jq`, `grep`, `awk`
- **Scriptable** — Works in cron jobs, CI/CD, shell scripts

## License

MIT — Part of the [Kill The MCP](https://killthemcp.com) project.
