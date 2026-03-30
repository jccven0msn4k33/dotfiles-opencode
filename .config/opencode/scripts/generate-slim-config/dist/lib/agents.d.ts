import type { AgentConfig, AgentRequirement, ModelsByProvider, ProviderInfo } from '../types.js';
export declare const AGENT_REQUIREMENTS: Record<string, AgentRequirement>;
export declare function selectModelForAgent(agentName: string, modelsByProvider: ModelsByProvider, providers: ProviderInfo): string | null;
export declare function buildAgentConfig(agentName: string, model: string): AgentConfig;
//# sourceMappingURL=agents.d.ts.map