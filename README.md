> "Six months ago, everyone was talking about MCPs. And I was like, screw MCPs. Every MCP would be better as a CLI."
>
> — [Peter Steinberger](https://twitter.com/steipete), Founder of OpenClaw
> [Watch on YouTube (~2:39:00)](https://www.youtube.com/@lexfridman) | [Lex Fridman Podcast #491](https://lexfridman.com/peter-steinberger/)

# bunq CLI

A production-ready command-line interface for the [bunq](https://bunq.com) banking API. Manage accounts, payments, cards, and payment requests directly from your terminal.

> **Disclaimer**: This is an unofficial CLI tool and is not affiliated with, endorsed by, or supported by bunq B.V.

## Features

- **Accounts** — List and manage monetary accounts
- **Payments** — Create and track payments
- **Cards** — Manage debit and credit cards
- **Requests** — Send and receive payment requests
- **Sandbox & Production** — Switch between environments
- **JSON output** — All commands support `--json` for scripting
- **Colorized output** — Clean, readable terminal output

## Why CLI > MCP

MCP servers are complex, stateful, and require a running server process. A CLI is:

- **Simpler** — Just a binary you call directly
- **Composable** — Pipe output to `jq`, `grep`, `awk`, and other tools
- **Scriptable** — Use in shell scripts, CI/CD pipelines, cron jobs
- **Debuggable** — See exactly what's happening with `--json` flag
- **AI-friendly** — AI agents can call CLIs just as easily as MCPs, with less overhead

## Installation

```bash
npm install -g @ktmcp-cli/bunqcom
```

## Authentication Setup

bunq uses API keys for authentication.

### 1. Create a bunq Account

1. Go to [bunq.com](https://bunq.com) and create an account
2. For testing, use the bunq Sandbox environment

### 2. Generate API Key

1. Open the bunq app
2. Go to Profile → Security & Settings → Developers
3. Generate a new API key
4. Copy the API key

### 3. Configure the CLI

```bash
# Set API key
bunqcom config set --api-key YOUR_API_KEY

# Set user ID (get from bunq app or API)
bunqcom config set --user-id YOUR_USER_ID

# Set environment (sandbox or production)
bunqcom config set --environment production
```

## Commands

### Configuration

```bash
# Set credentials
bunqcom config set --api-key <key> --user-id <id>

# Set environment
bunqcom config set --environment sandbox
bunqcom config set --environment production

# Show current config
bunqcom config show
```

### User

```bash
# Get user information
bunqcom user get
```

### Accounts

```bash
# List all accounts
bunqcom accounts list

# Get specific account
bunqcom accounts get <account-id>
```

### Payments

```bash
# List payments for an account
bunqcom payments list <account-id>

# Get specific payment
bunqcom payments get <account-id> <payment-id>

# Create a payment
bunqcom payments create <account-id> \
  --amount 10.00 \
  --currency EUR \
  --counterparty NL12BUNQ1234567890 \
  --description "Payment for invoice"
```

### Cards

```bash
# List all cards
bunqcom cards list

# Get specific card
bunqcom cards get <card-id>
```

### Requests

```bash
# List payment requests
bunqcom requests list <account-id>

# Create payment request
bunqcom requests create <account-id> \
  --amount 25.00 \
  --currency EUR \
  --counterparty user@example.com \
  --description "Request for dinner"
```

## JSON Output

All commands support `--json` for machine-readable output:

```bash
# Get accounts as JSON
bunqcom accounts list --json

# Pipe to jq
bunqcom payments list <account-id> --json | jq '.Response[] | .Payment'
```

## Examples

### Check account balance

```bash
bunqcom accounts list
```

### Send a payment

```bash
bunqcom payments create 12345 \
  --amount 50.00 \
  --currency EUR \
  --counterparty NL12BUNQ1234567890 \
  --description "Payment for services"
```

### Request money

```bash
bunqcom requests create 12345 \
  --amount 100.00 \
  --currency EUR \
  --counterparty friend@email.com \
  --description "Split dinner bill"
```

## Contributing

Issues and pull requests are welcome at [github.com/ktmcp-cli/bunqcom](https://github.com/ktmcp-cli/bunqcom).

## License

MIT — see [LICENSE](LICENSE) for details.

---

Part of the [KTMCP CLI](https://killthemcp.com) project — replacing MCPs with simple, composable CLIs.


---

## Support KTMCP

If you find this CLI useful, we'd greatly appreciate your support! Share your experience on:
- Reddit
- Twitter/X
- Hacker News

**Incentive:** Users who can demonstrate that their support/advocacy helped advance KTMCP will have their feature requests and issues prioritized.

Just be mindful - these are real accounts and real communities. Authentic mentions and genuine recommendations go a long way!

## Support This Project

If you find this CLI useful, we'd appreciate support across Reddit, Twitter, Hacker News, or Moltbook. Please be mindful - these are real community accounts. Contributors who can demonstrate their support helped advance KTMCP will have their PRs and feature requests prioritized.
