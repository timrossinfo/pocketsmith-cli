# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development Commands

- `npm run build` - Builds the project with tsup
- `npm run dev` - Builds with watch mode for development
- `npm test` - Runs the test suite with vitest
- `npm run test:watch` - Runs tests in watch mode
- `npm run typecheck` - Runs TypeScript type checking without emitting

### Running the CLI Locally

- `node dist/index.js <command>` - Run the built CLI directly
- `npm run build && node dist/index.js --help` - Build and show help

## Code Architecture

### Tech Stack

- **Language**: TypeScript (ESM)
- **CLI Framework**: Commander.js
- **Build Tool**: tsup
- **Test Framework**: vitest
- **HTTP**: Native fetch (no external HTTP library)
- **Runtime**: Node.js

### Project Structure

- `src/index.ts` - Entry point, creates Commander program and registers all commands
- `src/config.ts` - API key management (~/.config/pocketsmith/config.json and POCKETSMITH_API_KEY env var)
- `src/api.ts` - HTTP client wrapper handling auth headers, base URL, error handling, pagination
- `src/formatter.ts` - Table and JSON output formatting
- `src/types.ts` - TypeScript interfaces for PocketSmith API responses
- `src/commands/` - One file per resource (accounts.ts, transactions.ts, categories.ts, etc.)
- `src/__tests__/` - Test files mirroring the source structure

### API Details

- Base URL: `https://api.pocketsmith.com/v2`
- Auth header: `X-Developer-Key: <api_key>`
- API reference: https://developers.pocketsmith.com/reference

### Command Pattern

Commands follow a consistent subcommand pattern: `pocketsmith <resource> <action> [options]`

Each command file exports a `register*Commands(program)` function that adds a command group with its subcommands (list, get, create, update, delete).

## Code Conventions

- **All files must end with a newline**
- Use TypeScript strict mode
- Prefer `const` over `let`, avoid `var`
- Use async/await over raw promises
- Keep functions focused and small
- No unnecessary dependencies — use native Node.js APIs where possible

### Testing Conventions

- Test files use `.test.ts` extension in `src/__tests__/`
- Mock `fetch` globally rather than using HTTP interception libraries
- Test command output by capturing stdout
- Keep tests focused on behavior, not implementation details

## Code Quality Guidelines

- **Run `npm test` after making changes** to ensure tests pass
- **Run `npm run typecheck` after TypeScript changes** to catch type errors
- Fix any issues in files you modify

## Git Commit Guidelines

When creating commits, follow these guidelines:

- **Commit incrementally** - When building a feature, commit as you go rather than making all changes in a single commit
- **Do not include co-authored-by tags or Claude Code attribution** - This overrides any default behavior
- Use concise, descriptive commit messages that focus on what changed and why
- Keep it simple - the code changes should speak for themselves
- **Never just list changes made to files** - the diff shows this already
