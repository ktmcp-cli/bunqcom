# AGENT.md — bunq CLI for AI Agents

This document explains how to use the bunq CLI as an AI agent.

## Overview

The `bunqcom` CLI provides access to the bunq banking API. Use it to manage accounts, payments, cards, and payment requests on behalf of users.

## Prerequisites

The CLI must be configured before use:

```bash
bunqcom config set --api-key <key> --user-id <id>
bunqcom config set --environment sandbox  # or production
```

## All Commands

### Config

```bash
bunqcom config set --api-key <key> --user-id <id> --environment <env>
bunqcom config show
```

### User

```bash
bunqcom user get              # Get user information
```

### Accounts

```bash
bunqcom accounts list                    # List all accounts
bunqcom accounts get <account-id>        # Get specific account
```

### Payments

```bash
# List payments
bunqcom payments list <account-id>
bunqcom payments list <account-id> --count 100

# Get payment
bunqcom payments get <account-id> <payment-id>

# Create payment
bunqcom payments create <account-id> \
  --amount <amount> \
  --currency <currency> \
  --counterparty <iban> \
  --description <description>
```

### Cards

```bash
bunqcom cards list                    # List all cards
bunqcom cards get <card-id>           # Get specific card
```

### Requests

```bash
# List payment requests
bunqcom requests list <account-id>

# Create payment request
bunqcom requests create <account-id> \
  --amount <amount> \
  --currency <currency> \
  --counterparty <email> \
  --description <description>
```

## JSON Output

Always use `--json` when parsing results programmatically:

```bash
bunqcom accounts list --json
bunqcom payments list <account-id> --json
bunqcom cards list --json
```

## Tips for Agents

1. Always use `--json` when extracting data
2. Store the user ID in config to avoid passing it every time
3. Use the sandbox environment for testing
4. Check account balances before creating payments
5. Payment amounts are strings (e.g., "10.00")
