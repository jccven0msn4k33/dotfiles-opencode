import { detectProviders } from './lib/providers.js';
import { getAvailableModels, categorizeModels } from './lib/models.js';
import { generatePresets, generateCouncilConfig } from './lib/presets.js';
import { writeConfig, printSummary } from './lib/config.js';
import type { GeneratorOptions } from './types.js';

export async function generateConfig(options: GeneratorOptions): Promise<void> {
  console.log('\n[generate-slim-config] Starting configuration generation...\n');
  
  try {
    // Step 1: Detect providers
    console.log('  [1/5] Detecting providers...');
    const providers = await detectProviders(options.prefer);
    console.log(`        Found ${providers.all.length} provider(s): ${providers.all.join(', ')}`);
    
    if (providers.all.length === 0) {
      throw new Error('No providers configured. Please set up at least one provider in opencode.jsonc');
    }
    
    // Step 2: Get available models
    console.log('  [2/5] Fetching available models...');
    const models = await getAvailableModels(options.verbose);
    console.log(`        Found ${models.length} models`);
    
    if (models.length === 0) {
      throw new Error('No models available. Check your provider configuration.');
    }
    
    // Step 3: Categorize models
    console.log('  [3/5] Categorizing models by provider and tier...');
    const modelsByProvider = categorizeModels(models);
    
    if (options.verbose) {
      for (const [provider, tiers] of Object.entries(modelsByProvider)) {
        const total = tiers.high.length + tiers.medium.length + tiers.low.length;
        console.log(`        ${provider}: ${total} models (H:${tiers.high.length} M:${tiers.medium.length} L:${tiers.low.length})`);
      }
    }
    
    // Step 4: Generate presets
    console.log('  [4/5] Generating presets...');
    const presets = generatePresets(modelsByProvider, providers);
    const councilConfig = generateCouncilConfig(modelsByProvider, providers);
    console.log(`        Generated ${Object.keys(presets).length} preset(s)`);
    
    // Step 5: Write configuration
    console.log('  [5/5] Writing configuration...');
    await writeConfig(presets, councilConfig, options);
    
    // Print summary
    printSummary(presets, providers.all, options.verbose || false);
    
    console.log('\n✓ Configuration generation complete!');
    console.log('\nNext steps:');
    console.log('  1. Test with: opencode --agent orchestrator');
    console.log('  2. Switch presets by editing "preset" field in oh-my-opencode-slim.jsonc');
    console.log('  3. Or set: export OH_MY_OPENCODE_SLIM_PRESET=<preset-name>');
    
  } catch (error) {
    console.error('\n✗ Error:', (error as Error).message);
    if (options.verbose) {
      console.error('\nStack trace:', (error as Error).stack);
    }
    throw error;
  }
}
