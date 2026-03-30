# Agent Architecture

How the opencode orchestrator routes requests to specialized agents.

## Overview

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

## Available Agents

### Primary Agents

| Agent | Mode | Purpose |
|-------|------|---------|
| **obama** | primary | System-wide orchestrator - routes all requests |

### Specialized Subagents

| Agent | When to Use | Description |
|-------|-------------|-------------|
| **rails-migration-agent** | Rails migrations | Create migrations, cascade changes to model/spec/controller/routes/views |
| **web-audit-agent** | HTML/CSS/JS | Browser compatibility (caniuse), OWASP security audit |
| **debug-agent** | Production issues | Reproduce bugs, root cause analysis, test case creation |
| **component-doc-agent** | Understanding code | Explain component purpose, usage, API documentation |
| **project-onboarding-agent** | Project setup | Structure, setup instructions, architecture overview |
| **ruby-cocoder** | Complex Ruby tasks | Deep Ruby implementation, refactoring, patterns |

## Skill Routing

When the orchestrator detects project type, it auto-loads relevant skills:

| Project Type | Skills Loaded |
|--------------|---------------|
| Ruby on Rails | `ruby`, `ruby-on-rails` |
| Node.js (React) | `nodejs`, `reactjs` |
| Node.js (Vue) | `nodejs`, `vuejs` |
| Python (FastAPI) | `python`, `fastapi` |
| Python (Django) | `python` |
| PHP (Laravel) | `php` |
| Java | `java` |
| Kotlin/Android | `android-kotlin` |
| Any + Security | `owasp` (always first) |
| Any + Database | relevant SQL skill (always first) |

## Task-to-Agent Routing

| Your Request | Delegate To |
|--------------|-------------|
| "Add phone_number field to users" | `rails-migration-agent` |
| "Create new migration for orders table" | `rails-migration-agent` |
| "Check if CSS :has() selector works" | `web-audit-agent` |
| "Audit this JavaScript for security issues" | `web-audit-agent` |
| "Check caniuse for backdrop-filter" | `web-audit-agent` |
| "Debug the 500 error on production" | `debug-agent` |
| "Fix the login bug - steps to reproduce..." | `debug-agent` |
| "Create test cases from ticket" | `debug-agent` |
| "What does OrderService do?" | `component-doc-agent` |
| "How do I use the UserCard component?" | `component-doc-agent` |
| "Explain this model's enums" | `component-doc-agent` |
| "How do I set up this project?" | `project-onboarding-agent` |
| "What is the project structure?" | `project-onboarding-agent` |
| "What does this codebase do?" | `project-onboarding-agent` |
| "Add stow package for zsh" | `dotfiles-maintainer` |
| "Propagate changes to all distros" | `dotfiles-maintainer` |
| "Check for stow conflicts" | `dotfiles-maintainer` |

## Adding New Agents

1. Create agent file: `agents/<name>.md`
2. Add YAML frontmatter with mode and permissions:

```yaml
---
description: "When to use this agent"
mode: subagent  # or primary
permission:
  edit: ask
  bash:
    "*": allow
    "git commit*": ask
  webfetch: allow
---
```

3. Add agent to routing table in `obama.md`
4. Update this wiki page

## Agent Permission Levels

| Permission | Description |
|------------|-------------|
| `allow` | Agent can execute without confirmation |
| `ask` | Agent asks user before executing |
| `deny` | Agent cannot execute |

Permissions are defined in `opencode.jsonc` under `permission`.

---

## Model Configuration for Agents

**All agents use environment-based model configuration** to support multiple work environments.

### Environment Variables

Agents read model configuration from:

- `$OPENCODE_MODEL` - Primary model (e.g., `amazon-bedrock/anthropic.claude-sonnet-4-5...`)
- `$OPENCODE_SMALL_MODEL` - Smaller/faster model for quick tasks

### Why No Hardcoded Models?

❌ **Before:** Agent files specified `github-copilot/claude-sonnet-4.6`  
✅ **Now:** Agent files reference `$OPENCODE_MODEL` from environment

**Benefits:**
- Switch between work (AWS Bedrock) and personal (GitHub Copilot) seamlessly
- Subagents inherit correct model configuration
- Same agent works across all projects and machines

### Configuration Files

```jsonc
// ~/.config/opencode/opencode.jsonc
{
  "model": "{env:OPENCODE_MODEL}",
  "small_model": "{env:OPENCODE_SMALL_MODEL}"
}
```

```bash
# ~/.config/opencode/.env
OPENCODE_MODEL=amazon-bedrock/anthropic.claude-sonnet-4-5-20250929-v1:0
OPENCODE_SMALL_MODEL=amazon-bedrock/anthropic.claude-sonnet-4-5-20250929-v1:0
AWS_REGION=ap-southeast-2
AWS_PROFILE=your-profile
```

For troubleshooting model configuration issues, see the [Model Configuration Guide](https://github.com/jcchikikomori/.dotfiles/blob/main/docs/OPENCODE_MODEL_CONFIG.md).
