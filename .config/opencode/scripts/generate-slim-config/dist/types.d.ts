export interface Model {
    id: string;
    provider: string;
    name: string;
    tier: 'high' | 'medium' | 'low';
}
export interface ModelsByProvider {
    [provider: string]: {
        high: Model[];
        medium: Model[];
        low: Model[];
    };
}
export interface ProviderInfo {
    all: string[];
    connected: string[];
    priority: string[];
}
export interface AgentConfig {
    model: string | string[];
    variant?: 'high' | 'medium' | 'low';
    temperature?: number;
    skills?: string[];
    mcps?: string[];
}
export interface PresetConfig {
    [agentName: string]: AgentConfig;
}
export interface CouncillorConfig {
    model: string;
    variant?: 'high' | 'medium' | 'low';
    prompt?: string;
}
export interface CouncilPresetConfig {
    alpha?: CouncillorConfig;
    beta?: CouncillorConfig;
    gamma?: CouncillorConfig;
    master?: CouncillorConfig;
    [councillorName: string]: CouncillorConfig | undefined;
}
export interface CouncilConfig {
    master: {
        model: string;
        variant?: 'high' | 'medium' | 'low';
        prompt?: string;
    };
    presets: {
        [presetName: string]: CouncilPresetConfig;
    };
    default_preset: string;
    master_timeout: number;
    councillors_timeout: number;
    master_fallback?: string[];
    councillor_execution_mode: 'parallel' | 'sequential';
}
export interface FallbackConfig {
    enabled: boolean;
    timeoutMs: number;
    retryDelayMs: number;
    chains: {
        [agentName: string]: string[];
    };
}
export interface SlimConfig {
    $schema: string;
    preset: string;
    presets: {
        [presetName: string]: PresetConfig;
    };
    council?: CouncilConfig;
    fallback?: FallbackConfig;
}
export interface GeneratorOptions {
    dryRun?: boolean;
    reset?: boolean;
    preset?: string;
    prefer?: string;
    verbose?: boolean;
}
export interface AgentRequirement {
    tier: 'high' | 'medium' | 'low';
    priority: number;
    skills?: string[];
    mcps?: string[];
}
//# sourceMappingURL=types.d.ts.map