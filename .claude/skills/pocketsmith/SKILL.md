---
name: pocketsmith
description: Interacts with the PocketSmith personal finance API using the pocketsmith CLI. Use when the user asks about their finances, accounts, transactions, budgets, categories, or any PocketSmith data.
user-invocable: true
allowed-tools: Bash(pocketsmith *)
argument-hint: [query or task]
---

# PocketSmith CLI

Use the `pocketsmith` CLI to query and manage PocketSmith data. Always use `--json` and pipe through `jq` for filtering or extracting specific fields.

Always use the `pocketsmith` command directly if available.

## Quick reference

```bash
pocketsmith me                          # Current user
pocketsmith accounts list               # All accounts
pocketsmith accounts get <id>           # Account details
pocketsmith transactions list           # Recent transactions
pocketsmith categories list             # All categories
pocketsmith institutions list           # All institutions
pocketsmith budgets summary --period months --interval 6
pocketsmith labels list                 # All labels
pocketsmith currencies list             # Supported currencies
```

## Filtering transactions

```bash
pocketsmith transactions list --since 2024-01-01 --until 2024-12-31
pocketsmith transactions list --account <id>
pocketsmith transactions list --category <id>
pocketsmith transactions list --search "coffee"
pocketsmith transactions list --all     # All pages
pocketsmith transactions list --page 2 --per-page 50
```

## Creating and modifying data

```bash
pocketsmith transactions create <transaction-account-id> \
  --payee "Store" --amount -45.50 --date 2024-03-15
pocketsmith categories create --title "Groceries" --parent-id <id>
pocketsmith institutions create --title "My Bank" --currency NZD
```

## JSON output and jq

Always use `--json` for data extraction:

```bash
pocketsmith accounts list --json | jq '.[].title'
pocketsmith accounts list --json | jq '[.[] | {title, balance: .current_balance}]'
pocketsmith transactions list --all --json | jq '[.[] | select(.amount < 0)] | sort_by(.amount) | .[:10]'
```

## Answering financial questions

When the user asks about their finances:

1. Determine which data is needed (accounts, transactions, categories, budgets)
2. Fetch with `--json` and filter with `jq`
3. Perform calculations or summaries as needed
4. Present results clearly with currency formatting

For detailed command options, run `pocketsmith <command> --help`.
