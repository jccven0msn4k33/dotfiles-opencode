# Opencode Configuration

> **Part of [jcchikikomori/.dotfiles](https://github.com/jcchikikomori/.dotfiles)** — A standalone package containing [opencode](https://opencode.ai) configuration files that are stowed to `~/.config/opencode/`.

[![License: AI-Restricted MIT](https://img.shields.io/badge/License-AI--Restricted%20MIT-yellow.svg)](LICENSE)
[![dotfiles](https://img.shields.io/badge/dotfiles-jcchikikomori-blue.svg)](https://github.com/jcchikikomori/.dotfiles)

---

## Quick Start

```sh
# 1. Copy env template
cp ~/.config/opencode/.env.example ~/.config/opencode/.env

# 2. Fill in your tokens (see Required Tokens below)
nano ~/.config/opencode/.env

# 3. Enable MCPs in opencode.jsonc by setting "enabled": true
# Then restart your shell or source ~/.profile
```

---

## Table of Contents

- [Files](#files)
- [Architecture](#architecture)
- [Setup](#setup)
- [Required Tokens](#required-tokens)
- [Environment Loading](#environment-loading)
- [Per-Project Config](#per-project-configuration)
- [Plugins](#plugins)
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

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER REQUEST                           │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     OBAMA (Orchestrator)                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 1. Detect project type (files, git, imports)             │  │
│  │ 2. Load relevant skill(s)                                 │  │
│  │ 3. Route to specialized agent OR answer directly          │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
        ▼                         ▼                         ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│ SKILLS        │     │ AGENTS        │     │ DIRECT ANSWER │
│ (16 skills)   │     │ (6 agents)    │     │ (simple info) │
└───────────────┘     └───────────────┘     └───────────────┘
```

For detailed routing tables, see [AGENTS-README.md](AGENTS-README.md).

---

## Setup

1. Copy the example env file:

   ```sh
   cp ~/.config/opencode/.env.example ~/.config/opencode/.env
   ```

2. Edit `~/.config/opencode/.env` and fill in your tokens (see below).

3. Restart your shell (or `source ~/.profile`) to load the env vars.

4. Enable MCPs in `opencode.jsonc` by setting `"enabled": true`.

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

The `opencode()` function delegates to `~/.local/bin/org.jcchikikomori.dotfiles/bin/dotfiles-opencode-env`, which:
1. Loads `~/.config/opencode/.env`
2. Walks up from `$PWD` to find nearest `.opencode/.env` and loads it
3. `exec`s the real `opencode` binary

### Debug Toggle

```sh
OPENCODE_ENV_DEBUG=1 opencode
```

Example output:
```
[opencode-env] loaded: /home/you/.config/opencode/.env
[opencode-env] loaded: /home/you/my-project/.opencode/.env
[opencode-env] exec: /home/you/.local/bin/opencode
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
