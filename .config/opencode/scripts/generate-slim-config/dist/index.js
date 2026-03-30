#!/usr/bin/env node
import { Command } from 'commander';
import { generateConfig } from './generator.js';
const program = new Command();
program
    .name('generate-slim-config')
    .description('Generate oh-my-opencode-slim configuration with auto-detected models')
    .version('1.0.0')
    .option('--dry-run', 'Preview configuration without writing')
    .option('--reset', 'Force overwrite existing configuration')
    .option('--preset <name>', 'Set default preset', 'default')
    .option('--prefer <provider>', 'Prefer specific provider (e.g., github-copilot, amazon-bedrock)')
    .option('--verbose', 'Show detailed model selection process')
    .action(async (options) => {
    try {
        await generateConfig(options);
        process.exit(0);
    }
    catch (error) {
        console.error('\n✗ Fatal error:', error.message);
        if (options.verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
});
program.parse();
//# sourceMappingURL=index.js.map