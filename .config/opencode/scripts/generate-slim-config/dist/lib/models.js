import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
export async function getAvailableModels(verbose = false) {
    try {
        const { stdout } = await execAsync('opencode models');
        const models = stdout
            .split('\n')
            .filter(line => line.trim() && line.includes('/'))
            .map(parseModelLine)
            .filter((m) => m !== null);
        if (verbose) {
            console.log(`  Found ${models.length} models`);
        }
        return models;
    }
    catch (error) {
        throw new Error(`Failed to fetch models: ${error.message}`);
    }
}
function parseModelLine(line) {
    const trimmed = line.trim();
    if (!trimmed.includes('/'))
        return null;
    const [provider, ...nameParts] = trimmed.split('/');
    const name = nameParts.join('/');
    return {
        id: trimmed,
        provider,
        name,
        tier: categorizeTier(trimmed),
    };
}
function categorizeTier(modelId) {
    const id = modelId.toLowerCase();
    // High tier patterns
    const highPatterns = [
        /gpt-5\.4$/,
        /gpt-5\.3/,
        /gpt-5\.2/,
        /gpt-5\.1(?!.*mini)/,
        /claude-opus/,
        /claude-sonnet-4\.6/,
        /claude-sonnet-4\.5/,
        /gemini-3\.1-pro/,
        /gemini-3-pro/,
        /gemini-2\.5-pro/,
        /deepseek\.v3/,
        /deepseek\.r1/,
    ];
    // Low tier patterns
    const lowPatterns = [
        /mini$/,
        /flash/,
        /haiku/,
        /lite/,
        /nano/,
        /micro/,
        /fast/,
        /-3b-/,
        /-8b-/,
        /-11b-/,
        /-12b-/,
    ];
    if (highPatterns.some(p => p.test(id))) {
        return 'high';
    }
    if (lowPatterns.some(p => p.test(id))) {
        return 'low';
    }
    return 'medium';
}
export function categorizeModels(models) {
    const result = {};
    for (const model of models) {
        if (!result[model.provider]) {
            result[model.provider] = { high: [], medium: [], low: [] };
        }
        result[model.provider][model.tier].push(model);
    }
    return result;
}
//# sourceMappingURL=models.js.map