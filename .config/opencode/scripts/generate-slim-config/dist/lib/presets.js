import { selectModelForAgent, buildAgentConfig, AGENT_REQUIREMENTS } from './agents.js';
const AGENT_NAMES = Object.keys(AGENT_REQUIREMENTS);
export function generatePresets(modelsByProvider, providers) {
    const presets = {};
    // Default preset: balanced mixed approach
    presets.default = generateDefaultPreset(modelsByProvider, providers);
    // Provider-specific presets
    for (const provider of providers.all) {
        const providerModels = modelsByProvider[provider];
        if (!providerModels)
            continue;
        // Check if provider has enough models
        const totalModels = providerModels.high.length +
            providerModels.medium.length +
            providerModels.low.length;
        if (totalModels >= 2) {
            const presetName = getProviderPresetName(provider);
            presets[presetName] = generateProviderPreset(provider, modelsByProvider, providers);
        }
    }
    // Local preset if available
    const localProviders = providers.all.filter(p => p === 'ollama' || p === 'dmr');
    if (localProviders.length > 0) {
        presets.local = generateLocalPreset(modelsByProvider, localProviders);
    }
    // Cost-optimized preset (use lowest tier models)
    presets['cost-optimized'] = generateCostOptimizedPreset(modelsByProvider, providers);
    return presets;
}
function generateDefaultPreset(modelsByProvider, providers) {
    const preset = {};
    for (const agentName of AGENT_NAMES) {
        const model = selectModelForAgent(agentName, modelsByProvider, providers);
        if (model) {
            preset[agentName] = buildAgentConfig(agentName, model);
        }
    }
    return preset;
}
function generateProviderPreset(provider, modelsByProvider, providers) {
    const preset = {};
    const providerOnly = {
        all: [provider],
        connected: [provider],
        priority: [provider],
    };
    for (const agentName of AGENT_NAMES) {
        const model = selectModelForAgent(agentName, modelsByProvider, providerOnly);
        if (model) {
            preset[agentName] = buildAgentConfig(agentName, model);
        }
        else {
            // Fallback to mixed if provider doesn't have suitable model
            const mixedModel = selectModelForAgent(agentName, modelsByProvider, providers);
            if (mixedModel) {
                preset[agentName] = buildAgentConfig(agentName, mixedModel);
            }
        }
    }
    return preset;
}
function generateLocalPreset(modelsByProvider, localProviders) {
    const preset = {};
    const localOnly = {
        all: localProviders,
        connected: localProviders,
        priority: localProviders,
    };
    for (const agentName of AGENT_NAMES) {
        const model = selectModelForAgent(agentName, modelsByProvider, localOnly);
        if (model) {
            preset[agentName] = buildAgentConfig(agentName, model);
        }
    }
    return preset;
}
function generateCostOptimizedPreset(modelsByProvider, providers) {
    const preset = {};
    for (const agentName of AGENT_NAMES) {
        // Force low tier for all agents
        let model = null;
        for (const provider of providers.priority) {
            const providerModels = modelsByProvider[provider];
            if (!providerModels)
                continue;
            if (providerModels.low.length > 0) {
                model = providerModels.low[0].id;
                break;
            }
        }
        // Fallback to any model
        if (!model) {
            model = selectModelForAgent(agentName, modelsByProvider, providers);
        }
        if (model) {
            preset[agentName] = buildAgentConfig(agentName, model);
        }
    }
    return preset;
}
function getProviderPresetName(provider) {
    const nameMap = {
        'github-copilot': 'copilot',
        'amazon-bedrock': 'bedrock',
        'google': 'google',
        'openai': 'openai',
        'anthropic': 'anthropic',
    };
    return nameMap[provider] || provider;
}
export function generateCouncilConfig(modelsByProvider, providers) {
    const masterModel = selectModelForAgent('oracle', modelsByProvider, providers) ||
        selectModelForAgent('orchestrator', modelsByProvider, providers) ||
        '';
    const councillors = selectDiverseModels(modelsByProvider, providers, 3);
    return {
        master: {
            model: masterModel,
            variant: 'high',
        },
        presets: {
            default: {
                alpha: {
                    model: councillors[0] || masterModel,
                    prompt: 'You are a performance and optimization expert',
                },
                beta: {
                    model: councillors[1] || masterModel,
                    prompt: 'You are a security and safety specialist',
                },
                gamma: {
                    model: councillors[2] || masterModel,
                    prompt: 'You are an architecture and design reviewer',
                },
            },
        },
        default_preset: 'default',
        master_timeout: 300000,
        councillors_timeout: 180000,
        councillor_execution_mode: 'parallel',
    };
}
function selectDiverseModels(modelsByProvider, providers, count) {
    const selected = [];
    const usedProviders = new Set();
    // Try to get models from different providers
    for (const provider of providers.priority) {
        if (selected.length >= count)
            break;
        if (usedProviders.has(provider))
            continue;
        const providerModels = modelsByProvider[provider];
        if (!providerModels)
            continue;
        // Prefer medium tier for councillors
        const model = providerModels.medium[0]?.id ||
            providerModels.high[0]?.id ||
            providerModels.low[0]?.id;
        if (model) {
            selected.push(model);
            usedProviders.add(provider);
        }
    }
    // Fill remaining slots with any available models
    if (selected.length < count) {
        for (const provider of providers.all) {
            if (selected.length >= count)
                break;
            const providerModels = modelsByProvider[provider];
            if (!providerModels)
                continue;
            for (const tier of ['medium', 'high', 'low']) {
                for (const model of providerModels[tier]) {
                    if (!selected.includes(model.id)) {
                        selected.push(model.id);
                        if (selected.length >= count)
                            break;
                    }
                }
                if (selected.length >= count)
                    break;
            }
        }
    }
    // Ensure we have at least count models (duplicate if necessary)
    while (selected.length < count && selected.length > 0) {
        selected.push(selected[0]);
    }
    return selected;
}
//# sourceMappingURL=presets.js.map