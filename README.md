# PocketSmith CLI

A command-line tool for interacting with the [PocketSmith](https://www.pocketsmith.com/) personal finance API.

## Installation

```sh
npm install
npm run build
npm link
```

## Setup

Get a developer key from your [PocketSmith account settings](https://my.pocketsmith.com/security/manage_keys), then:

```sh
pocketsmith config set-key YOUR_API_KEY
```

Or set it as an environment variable:

```sh
export POCKETSMITH_API_KEY=YOUR_API_KEY
```

Verify it works:

```sh
pocketsmith me
```

## Usage

```
pocketsmith <command> <subcommand> [options]
```

### Global options

| Option | Description |
|---|---|
| `--json` | Output as JSON |
| `--user-id <id>` | Override user ID (default: auto-detect) |

### Commands

| Command | Description |
|---|---|
| `config set-key <key>` | Save your API key |
| `config show` | Show current configuration |
| `me` | Show the authenticated user |
| `accounts list\|get\|update\|delete` | Manage accounts |
| `transactions list\|get\|create\|update\|delete` | Manage transactions |
| `categories list\|get\|create\|update\|delete` | Manage categories |
| `institutions list\|get\|create\|update\|delete` | Manage institutions |
| `budgets list\|summary\|trend-analysis\|clear-cache` | View budget data |
| `events list\|get\|create\|update\|delete` | Manage budget events |
| `attachments list\|get\|update\|assign\|unassign\|delete` | Manage attachments |
| `labels list` | View labels |
| `currencies list\|get` | View currencies |

### Examples

```sh
# List accounts
pocketsmith accounts list

# List transactions with filters
pocketsmith transactions list --since 2024-01-01 --until 2024-12-31
pocketsmith transactions list --account 12345
pocketsmith transactions list --search "coffee"
pocketsmith transactions list --all  # fetch all pages

# Create a transaction
pocketsmith transactions create 12345 --payee "Store" --amount -45.50 --date 2024-03-15

# JSON output with jq
pocketsmith accounts list --json | jq '.[].title'
pocketsmith transactions list --all --json | jq '[.[] | select(.amount < 0)] | sort_by(.amount) | .[:10]'

# Budget summary
pocketsmith budgets summary --period months --interval 6
```

Run `pocketsmith <command> --help` for detailed usage of any command.

## Claude Code Skill

This project includes a [Claude Code skill](https://code.claude.com/docs/en/skills) that lets Claude interact with your PocketSmith data during conversations. Once the CLI is installed and configured, you can ask Claude natural language questions about your finances:

- "What are my account balances?"
- "Show me my largest expenses this month"
- "How much have I spent on groceries since January?"

Invoke it directly with `/pocketsmith` or just ask a financial question — Claude will use the skill automatically.

The skill is defined in `.claude/skills/pocketsmith/SKILL.md`.

## Use with Claude Desktop

The CLI's functionality is also available as a Claude Desktop Extension, so you can ask
Claude about your accounts, transactions, categories, and budgets directly.

### Install

1. Download `pocketsmith.mcpb` from the [latest release](https://github.com/timrossinfo/pocketsmith-cli/releases).
2. In Claude Desktop, open **Settings → Extensions → Install Extension…** and choose the file
   (or just double-click the file).
3. When prompted, paste a PocketSmith developer key. Create a new key under
   [Security & integrations → Manage developer keys](https://my.pocketsmith.com/security/manage_keys),
   then copy and paste it into Claude. The key is stored in your OS keychain.

### What Claude can do

Read your user profile, accounts, transactions (with search and date filtering), categories,
budgets and budget summaries, events, institutions, labels, currencies, and attachments.
It can also create and update transactions and categories, and update budget events —
Claude Desktop asks for confirmation before any change. The extension never deletes data.

### Build from source

```bash
npm install
npm run mcpb   # produces pocketsmith.mcpb
```

## Development

```sh
npm run dev          # Build with watch mode
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run typecheck    # Type check
```
