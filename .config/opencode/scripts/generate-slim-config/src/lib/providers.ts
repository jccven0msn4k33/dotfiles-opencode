import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';
import stripJsonComments from 'strip-json-comments';
import type { ProviderInfo } from '../types.js';

const execAsync = promisify(exec);

const PROVIDER_PRIORITY = [
  'github-copilot',
  'amazon-bedrock',
  'google',
  'openai',
  'anthropic',
  'ollama',
  'dmr',
];

export async function detectProviders(preferredProvider?: string): Promise<ProviderInfo> {
  const configPath = join(homedir(), '.config/opencode/opencode.jsonc');
  
  try {
    const configContent = await readFile(configPath, 'utf8');
    const config = JSON.parse(stripJsonComments(configContent));
    
    const providers = Object.keys(config.provider || {});
    
    if (providers.length === 0) {
      throw new Error('No providers configured in opencode.jsonc');
    }
    
    // Test connections (simplified - assume all are connected if configured)
    const connected = providers;
    
    // Prioritize providers
    let prioritized = [...providers].sort((a, b) => {
      const aIdx = PROVIDER_PRIORITY.indexOf(a);
      const bIdx = PROVIDER_PRIORITY.indexOf(b);
      if (aIdx === -1) return 1;
      if (bIdx === -1) return -1;
      return aIdx - bIdx;
    });
    
    // If preferred provider specified, move it to front
    if (preferredProvider && providers.includes(preferredProvider)) {
      prioritized = [
        preferredProvider,
        ...prioritized.filter(p => p !== preferredProvider),
      ];
    }
    
    return {
      all: providers,
      connected,
      priority: prioritized,
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Config file not found: ${configPath}`);
    }
    throw error;
  }
}

export async function testProviderConnection(provider: string): Promise<boolean> {
  // Simple heuristic: if provider is in config, assume it's available
  // In production, could ping the provider API
  return true;
}
