# Opencode Configuration

> **Part of [jcchikikomori/.dotfiles](https://github.com/jcchikikomori/.dotfiles)** — A standalone package containing [opencode](https://opencode.ai) configuration files that are stowed to `~/.config/opencode/`.

[![License: AI-Restricted MIT](https://img.shields.io/badge/License-AI--Restricted%20MIT-yellow.svg)](LICENSE)
[![dotfiles](https://img.shields.io/badge/dotfiles-jcchikikomori-blue.svg)](https://github.com/jcchikikomori/.dotfiles)

---

## About the Orchestrator

The default agent is named **Obama** — a nickname the owner picked up in high school due to a resemblance to [Barack Obama](https://en.wikipedia.org/wiki/Barack_Obama). Obama acts as the system-wide orchestrator that routes requests to specialized agents based on project context.

See [AGENTS-README.md](AGENTS-README.md) for full architecture and routing details.

---

## Table of Contents

- [Opencode Configuration](#opencode-configuration)
  - [About the Orchestrator](#about-the-orchestrator)
  - [Table of Contents](#table-of-contents)
  - [Files](#files)
  - [Architecture](#architecture)
  - [Setup](#setup)
  - [Required Tokens](#required-tokens)
  - [Environment Loading](#environment-loading)
    - [Global vs Project-Level](#global-vs-project-level)
    - [How the Wrapper Works](#how-the-wrapper-works)
    - [Debug Toggle](#debug-toggle)
    - [Recursion Safety](#recursion-safety)
  - [Per-Project Configuration](#per-project-configuration)
    - [Minimal Project Config Example](#minimal-project-config-example)
    - [opencode-mem Plugin](#opencode-mem-plugin)
  - [Security](#security)
  - [License](#license)

---

## Files

| File | Purpose |
|------|---------|
| `opencode.jsonc` | Main config: MCPs, provider, permissions |
| `AGENTS.md` | Global agent instructions |
| `AGENTS-README.md` | Agent architecture & routing |
| `.env.example` | Template for MCP environment variables |
| `.env` | **Local-only** (gitignored) — your actual tokens |

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                          USER REQUEST                           │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     OBAMA (Orchestrator)                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 1. Detect project type (files, git, imports)              │  │
│  │ 2. Load relevant skill(s)                                 │  │
│  │ 3. Route to specialized agent OR answer directly          │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                  │
        ┌─────────────────────────┼───────────────────────┐
        │                         │                       │
        ▼                         ▼                       ▼
┌───────────────┐         ┌───────────────┐       ┌───────────────┐
│ SKILLS        │         │ AGENTS        │       │ DIRECT ANSWER │
│ (16 skills)   │         │ (6 agents)    │       │ (simple info) │
└───────────────┘         └───────────────┘       └───────────────┘
```

For detailed routing tables, see [AGENTS-README.md](AGENTS-README.md).

---

## Setup

Clone this repository, then setup this into your system

```sh
git clone https://github.com/jcchikikomori/dotfiles-opencode.git
cd dotfiles-opencode
mkdir -p ~/.config
cp -r .config/opencode ~/.config
mkdir -p ~/.local/bin
cp bin/dotfiles-opencode-env ~/.local/bin/

export PATH="$HOME/.local/bin:PATH"
```

Copy the example env file:

```sh
cp ~/.config/opencode/.env.example ~/.config/opencode/.env
```

Edit `~/.config/opencode/.env` and fill in your tokens (see below).

Restart your shell (or `source ~/.profile`) to load the env vars.

Enable MCPs in `opencode.jsonc` by setting `"enabled": true`.

---

## Required Tokens

| MCP | Required Env Vars | How to Get |
|-----|-------------------|------------|
| `github` | `GITHUB_PERSONAL_ACCESS_TOKEN` | [GitHub Settings → Developer settings → PAT](https://github.com/settings/tokens) |
| `stackoverflow-mcp` | `STACK_EXCHANGE_API_KEY` | [Stack Apps → Register](https://stackapps.com/apps/oauth/register) |
| `framelink-figma` | `FIGMA_API_KEY` | [Figma Settings → Personal Access Tokens](https://www.figma.com/developers/api#access-tokens) |
| `atlassian-mcp` | `JIRA_URL`, `JIRA_USERNAME`, `JIRA_API_TOKEN`, `CONFLUENCE_URL`, `CONFLUENCE_USERNAME`, `CONFLUENCE_API_TOKEN` | [Atlassian API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens) |
| `sonarqube-mcp` | `SONARQUBE_TOKEN`, `SONARQUBE_URL` | Your SonarQube instance → My Account → Security |
| `buildkite-mcp` | **None** — uses OAuth | Remote MCP at `https://mcp.buildkite.com/mcp`; authenticate via OAuth browser flow when first enabled |

---

## Model Configuration

**IMPORTANT:** This configuration uses **environment variables** for model selection to support multiple environments (work, personal, different providers).

### Required Environment Variables

Add these to `~/.config/opencode/.env`:

```bash
# Model Configuration (REQUIRED)
OPENCODE_MODEL=amazon-bedrock/anthropic.claude-sonnet-4-5-20250929-v1:0
OPENCODE_SMALL_MODEL=amazon-bedrock/anthropic.claude-sonnet-4-5-20250929-v1:0

# Provider-specific configuration
# For Amazon Bedrock:
AWS_REGION=ap-southeast-2
AWS_PROFILE=your-aws-profile

# For GitHub Copilot (if using instead of Bedrock):
# OPENCODE_MODEL=github-copilot/claude-sonnet-4
# OPENCODE_SMALL_MODEL=github-copilot/claude-haiku-4
```

### Why Environment Variables?

✅ **Multi-environment support** - Switch between work (AWS Bedrock) and personal (GitHub Copilot) projects  
✅ **Subagent compatibility** - Subagents inherit model config correctly  
✅ **Provider flexibility** - Change providers without editing config files  
✅ **No hardcoded models** - Same config works across all machines

### Configuration Hierarchy

Models are resolved in this order:

1. Project `.opencode/opencode.jsonc` (if it defines a model)
2. Global `~/.config/opencode/opencode.jsonc` (uses `{env:OPENCODE_MODEL}`)
3. Environment variable `$OPENCODE_MODEL` from `.env` file

### Supported Providers

| Provider | Model Prefix | Example |
|----------|--------------|---------|
| Amazon Bedrock | `amazon-bedrock/` | `amazon-bedrock/anthropic.claude-sonnet-4-5-20250929-v1:0` |
| GitHub Copilot | `github-copilot/` | `github-copilot/claude-sonnet-4` |
| Ollama | `ollama/` | `ollama/qwen2.5-coder:32b` |
| OpenRouter | `openrouter/` | `openrouter/anthropic/claude-sonnet-4` |

For detailed troubleshooting and best practices, see the [Model Configuration Guide](https://github.com/jcchikikomori/.dotfiles/blob/main/docs/OPENCODE_MODEL_CONFIG.md) in the main dotfiles repo.

---

## Environment Loading

### Global vs Project-Level

The `.env` file is sourced automatically by `~/.profile` on shell startup:

```sh
if [ -f "$HOME/.config/opencode/.env" ]; then
    set -a  # Auto-export all variables
    . "$HOME/.config/opencode/.env"
    set +a
fi
```

When you run `opencode`, a shell wrapper loads env files in this order:

1. `~/.config/opencode/.env` — global tokens (loaded first, lower precedence)
2. Nearest `$PWD` ancestor `.opencode/.env` — project-specific overrides (loaded second, wins)

This happens **per invocation** via a subshell — no persistent shell pollution.

### How the Wrapper Works

The `opencode()` function delegates to `~/.local/bin/dotfiles-opencode-env`, which:

1. Loads `~/.config/opencode/.env`
2. Walks up from `$PWD` to find nearest `.opencode/.env` and loads it
3. `exec`s the real `opencode` binary

### Debug Toggle

```sh
_DOTFILES_OPENCODE_ENV_DEBUG=1 opencode
```

### Recursion Safety

The wrapper sets `_DOTFILES_OPENCODE_ENV_LOADED=1` before `exec`-ing opencode, preventing infinite loops if the function is re-entered.

---

## Per-Project Configuration

Override the global config by placing `opencode.jsonc` in your project:

```text
your-project/
├── opencode.jsonc          # option A: project root
└── .opencode/
    └── opencode.jsonc      # option B: hidden directory
```

Opencode merges configs in this order (last wins):

1. `~/.config/opencode/opencode.jsonc` — global
2. `<project-root>/opencode.jsonc` or `<project-root>/.opencode/opencode.jsonc` — project-level

### Minimal Project Config Example

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": [
    "AGENTS.md"
  ],
  "mcp": {
    "sonarqube-mcp": {
      "enabled": true
    }
  }
}
```

### opencode-mem Plugin

The `opencode-mem` plugin uses environment variables for user profile information:

| Variable | Purpose |
|----------|---------|
| `OPENCODE_MEM_USER_EMAIL` | Your email for memory attribution |
| `OPENCODE_MEM_USER_NAME` | Your name for memory attribution |

---

## Security

- `.env` is gitignored via `**/.config/**/.env` pattern
- **Never commit tokens** to git
- Use separate tokens per machine if possible (easier to revoke)
- Take control of your own configuration — avoid unnecessary plugins like `oh-my-opencode`

---

## License

Copyright (c) 2026 John Cyrill Corsanes

This project is licensed under the **AI-Restricted MIT License** — see [LICENSE](LICENSE) for full text.

**Key point:** Permission is granted for human use, but **AI/ML/LLM systems are prohibited** from training on or deriving output from this code.
