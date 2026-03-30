# generate-slim-config

Automatically generates `oh-my-opencode-slim.jsonc` configuration by detecting available models from your OpenCode providers.

## Features

- ✅ **Auto-detects providers** from `~/.config/opencode/opencode.jsonc`
- ✅ **Fetches available models** via `opencode models` command
- ✅ **Categorizes models** by tier (high/medium/low) and provider
- ✅ **Mixed approach** - Selects best model per agent across all providers
- ✅ **Multiple presets** - Generates default, provider-specific, local, and cost-optimized presets
- ✅ **Council configuration** - Auto-configures multi-LLM consensus system
- ✅ **Backup existing config** - Never overwrites without backup
- ✅ **Fallback chains** - Automatic failover configuration

## Installation

This tool is embedded in the dotfiles repository. Build it once:

```bash
cd ~/.dotfiles/linux/opencode/.config/opencode/scripts/generate-slim-config
npm install
npm run build
```

## Usage

### Via dotfiles-opencode (Recommended)

```bash
# Generate config with defaults
dotfiles-opencode install-slim-config

# Preview without writing
dotfiles-opencode install-slim-config --dry-run

# Force regenerate (overwrite existing)
dotfiles-opencode install-slim-config --reset

# Use specific preset as default
dotfiles-opencode install-slim-config --preset copilot

# Prefer specific provider
dotfiles-opencode install-slim-config --prefer github-copilot

# Verbose output
dotfiles-opencode install-slim-config --verbose
```

### Direct Usage

```bash
cd ~/.dotfiles/linux/opencode/.config/opencode/scripts/generate-slim-config
node dist/index.js [options]
```

## What It Does

1. **Detects** available providers from `~/.config/opencode/opencode.jsonc`
2. **Fetches** model list via `opencode models` command
3. **Categorizes** models by tier and provider:
   - **High tier**: GPT-5.4, Claude Opus, Gemini 3.1 Pro, etc.
   - **Medium tier**: Claude Sonnet, Gemini Flash, etc.
   - **Low tier**: GPT-5.4-mini, Claude Haiku, etc.
4. **Selects** optimal models for each agent based on requirements
5. **Generates** multiple presets for different use cases
6. **Writes** complete configuration to `~/.config/opencode/oh-my-opencode-slim.jsonc`

## Presets Generated

| Preset | Description |
|--------|-------------|
| **default** | Balanced mix - best available model per agent across all providers |
| **copilot** | GitHub Copilot models only (if available) |
| **bedrock** | Amazon Bedrock models only (if available) |
| **google** | Google models only (if available) |
| **local** | Ollama/DMR models only (offline use) |
| **cost-optimized** | Cheapest models that meet minimum requirements |

## Agent Model Assignments

The generator uses a **mixed approach** - selecting the best available model for each agent across all providers:

| Agent | Tier | Purpose | Example Models |
|-------|------|---------|----------------|
| **orchestrator** | high | Master delegator | gpt-5.4, claude-opus-4.6 |
| **oracle** | high | Strategic advisor | claude-opus-4.6, gpt-5.4 |
| **explorer** | low | Fast code search | gpt-5.4-mini, claude-haiku-4.5 |
| **librarian** | low | Doc lookup | gpt-5.4-mini, gemini-flash |
| **designer** | medium | UI/UX design | gemini-3.1-pro, claude-sonnet-4.6 |
| **fixer** | low | Quick fixes | gpt-5.4-mini, kimi-k2.5 |
| **council** | medium | Multi-LLM consensus | Mixed models from different families |

## Council Configuration

The generator automatically creates a council configuration with:
- **Master model**: High-tier model for synthesis
- **3 diverse councillors**: Models from different providers/families
- **Parallel execution**: All councillors respond simultaneously
- **Timeouts**: 300s master, 180s per councillor

## Options

```
--dry-run              Preview configuration without writing
--reset                Force overwrite existing configuration
--preset <name>        Set default preset (default: 'default')
--prefer <provider>    Prefer specific provider (e.g., github-copilot)
--verbose              Show detailed model selection process
```

## Troubleshooting

### `ProviderModelNotFoundError`
Your current config references invalid models. Fix with:
```bash
dotfiles-opencode install-slim-config --reset
```

### No models available
Ensure at least one provider is configured:
```bash
opencode models  # Should list available models
```

### Invalid model selected
Check with verbose output:
```bash
dotfiles-opencode install-slim-config --verbose --dry-run
```

### Permission errors
Ensure the script is executable:
```bash
chmod +x ~/.dotfiles/linux/opencode/.config/opencode/scripts/generate-slim-config/dist/index.js
```

## Development

### Build

```bash
npm run build
```

### Watch mode

```bash
npm run dev
```

### Project Structure

```
generate-slim-config/
├── src/
│   ├── index.ts              # CLI entry point
│   ├── generator.ts          # Main generation logic
│   ├── types.ts              # TypeScript definitions
│   └── lib/
│       ├── providers.ts      # Provider detection
│       ├── models.ts         # Model discovery & categorization
│       ├── agents.ts         # Agent model selection
│       ├── presets.ts        # Preset generation
│       └── config.ts         # Config file I/O
├── dist/                     # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

## Examples

### Example Output (GitHub Copilot + Amazon Bedrock)

```jsonc
{
  "$schema": "https://unpkg.com/oh-my-opencode-slim@latest/oh-my-opencode-slim.schema.json",
  "preset": "default",
  "presets": {
    "default": {
      "orchestrator": { "model": "github-copilot/gpt-5.4", "variant": "high", "skills": ["*"], "mcps": ["websearch"] },
      "oracle": { "model": "amazon-bedrock/anthropic.claude-opus-4-6-v1", "variant": "high" },
      "explorer": { "model": "github-copilot/gpt-5.4-mini", "variant": "low" },
      "librarian": { "model": "github-copilot/gpt-5.4-mini", "variant": "low", "mcps": ["websearch", "context7", "grep_app"] },
      "designer": { "model": "github-copilot/gemini-3.1-pro-preview", "variant": "medium", "skills": ["agent-browser"] },
      "fixer": { "model": "github-copilot/gpt-5.4-mini", "variant": "low" },
      "council": { "model": "amazon-bedrock/anthropic.claude-sonnet-4-6", "variant": "medium" }
    }
  }
}
```

## License

MIT
