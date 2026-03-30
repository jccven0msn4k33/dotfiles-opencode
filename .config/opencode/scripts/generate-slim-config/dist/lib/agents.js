export const AGENT_REQUIREMENTS = {
    orchestrator: {
        tier: 'high',
        priority: 1,
        skills: ['*'],
        mcps: ['websearch'],
    },
    oracle: {
        tier: 'high',
        priority: 2,
        skills: [],
        mcps: [],
    },
    explorer: {
        tier: 'low',
        priority: 5,
        skills: [],
        mcps: [],
    },
    librarian: {
        tier: 'low',
        priority: 6,
        skills: [],
        mcps: ['websearch', 'context7', 'grep_app'],
    },
    designer: {
        tier: 'medium',
        priority: 4,
        skills: ['agent-browser'],
        mcps: [],
    },
    fixer: {
        tier: 'low',
        priority: 7,
        skills: [],
        mcps: [],
    },
    council: {
        tier: 'medium',
        priority: 3,
        skills: [],
        mcps: [],
    },
};
export function selectModelForAgent(agentName, modelsByProvider, providers) {
    const req = AGENT_REQUIREMENTS[agentName];
    if (!req)
        return null;
    // Mixed approach: try each provider in priority order
    for (const provider of providers.priority) {
        const providerModels = modelsByProvider[provider];
        if (!providerModels)
            continue;
        const tierModels = providerModels[req.tier];
        if (tierModels && tierModels.length > 0) {
            return tierModels[0].id;
        }
    }
    // Fallback: try any tier from priority providers
    for (const provider of providers.priority) {
        const providerModels = modelsByProvider[provider];
        if (!providerModels)
            continue;
        // Try adjacent tiers
        const fallbackTiers = req.tier === 'high' ? ['medium', 'low'] :
            req.tier === 'low' ? ['medium', 'high'] :
                ['high', 'low'];
        for (const tier of fallbackTiers) {
            const models = providerModels[tier];
            if (models && models.length > 0) {
                return models[0].id;
            }
        }
    }
    // Last resort: any model from any provider
    for (const provider of providers.all) {
        const providerModels = modelsByProvider[provider];
        if (!providerModels)
            continue;
        for (const tier of ['high', 'medium', 'low']) {
            const models = providerModels[tier];
            if (models && models.length > 0) {
                return models[0].id;
            }
        }
    }
    return null;
}
export function buildAgentConfig(agentName, model) {
    const req = AGENT_REQUIREMENTS[agentName];
    return {
        model,
        variant: req.tier === 'high' ? 'high' : req.tier === 'medium' ? 'medium' : 'low',
        ...(req.skills && req.skills.length > 0 && { skills: req.skills }),
        ...(req.mcps && req.mcps.length > 0 && { mcps: req.mcps }),
    };
}
//# sourceMappingURL=agents.js.map