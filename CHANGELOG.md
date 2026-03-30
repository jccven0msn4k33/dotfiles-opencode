# Changelog

All notable changes to this opencode configuration package.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- AI-Restricted MIT License
- README badges and Quick Start section
- Table of Contents and architecture diagram
- AGENTS-README.md with agent routing tables
- wiki/Getting-Started.md
- wiki/Agent-Architecture.md
- CONTRIBUTING.md
- `bin/dotfiles-opencode-env` wrapper for project-level .env loading
- **Model Configuration section in README** - Documents environment-based model setup
- **Model Configuration section in Agent Architecture** - Explains why hardcoded models are removed

### Changed
- Updated repo description on GitHub
- README restructured with better navigation
- **⚠️ BREAKING: Removed hardcoded model references from agent files** - All agents now use `{env:OPENCODE_MODEL}`
- **obama.md agent** - Now documents model configuration via environment variables instead of hardcoding GitHub Copilot models
- **opencode.jsonc** - Uses environment variable interpolation for model configuration

### Migration Guide

If you have existing configurations with hardcoded models:

1. Add to `~/.config/opencode/.env`:
   ```bash
   OPENCODE_MODEL=your-provider/your-model
   OPENCODE_SMALL_MODEL=your-provider/your-small-model
   ```

2. Update your `opencode.jsonc`:
   ```jsonc
   {
     "model": "{env:OPENCODE_MODEL}",
     "small_model": "{env:OPENCODE_SMALL_MODEL}"
   }
   ```

3. For AWS Bedrock, also add:
   ```bash
   AWS_REGION=your-region
   AWS_PROFILE=your-profile
   ```

See the [Model Configuration Guide](https://github.com/jcchikikomori/.dotfiles/blob/main/docs/OPENCODE_MODEL_CONFIG.md) for detailed instructions.

---

## [1.0.0] - 2026-03-28

### Added
- Initial opencode configuration package
- opencode.jsonc with MCPs, providers, permissions
- AGENTS.md with global agent instructions
- .env.example template
- Per-project env loading via dotfiles-opencode-env wrapper
- opencode-mem plugin configuration
- Git commit guard plugin
