import * as vscode from 'vscode';
import { deleteStoredLlmApiKey, getStoredLlmApiKey, setStoredLlmApiKey } from '../core/secret-storage';
import modelCatalogData from './model-catalog.json';

export type LlmProvider = 'gemini' | 'openai' | 'claude';
export type LlmProfile = 'free' | 'balanced' | 'deep';

const MODEL_CATALOG = modelCatalogData as Record<LlmProvider, Record<LlmProfile, string[]>>;

export async function getLlmApiKey(): Promise<string | undefined> {
  return getStoredLlmApiKey();
}

export function getLlmProvider(): LlmProvider {
  const llmConfig = vscode.workspace.getConfiguration('ai-guardian.llm');
  return llmConfig.get<LlmProvider>('provider', 'gemini');
}

export function getLlmProfile(): LlmProfile {
  const llmConfig = vscode.workspace.getConfiguration('ai-guardian.llm');
  return llmConfig.get<LlmProfile>('profile', 'free');
}

export function getRecommendedModels(provider?: LlmProvider, profile?: LlmProfile): string[] {
  const selectedProvider = provider ?? getLlmProvider();
  const selectedProfile = profile ?? getLlmProfile();
  return MODEL_CATALOG[selectedProvider][selectedProfile];
}

export function getLlmModel(provider?: LlmProvider): string {
  const selectedProvider = provider ?? getLlmProvider();
  const selectedProfile = getLlmProfile();
  const llmConfig = vscode.workspace.getConfiguration('ai-guardian.llm');
  const configured = llmConfig.get<string>('model', '');
  if (configured && configured.trim().length > 0) {
    return configured;
  }

  return getRecommendedModels(selectedProvider, selectedProfile)[0];
}

export function getLlmBaseUrl(): string | undefined {
  const llmConfig = vscode.workspace.getConfiguration('ai-guardian.llm');
  const baseUrl = llmConfig.get<string>('baseUrl', '');
  return baseUrl && baseUrl.trim().length > 0 ? baseUrl.trim() : undefined;
}

export function getLlmTimeoutMs(): number {
  const llmConfig = vscode.workspace.getConfiguration('ai-guardian.llm');
  const value = llmConfig.get<number>('timeoutMs', 20000);
  return Number.isFinite(value) && value >= 3000 ? value : 20000;
}

export function getLlmMaxRetries(): number {
  const llmConfig = vscode.workspace.getConfiguration('ai-guardian.llm');
  const value = llmConfig.get<number>('maxRetries', 2);
  if (!Number.isFinite(value)) {
    return 2;
  }

  return Math.min(5, Math.max(0, Math.floor(value)));
}

export function getLlmMaxCallsPerHour(): number {
  const llmConfig = vscode.workspace.getConfiguration('ai-guardian.llm');
  const value = llmConfig.get<number>('maxCallsPerHour', 30);
  if (!Number.isFinite(value)) {
    return 30;
  }

  return Math.min(500, Math.max(1, Math.floor(value)));
}

export function getLlmMaxAuditsPerFilePerHour(): number {
  const llmConfig = vscode.workspace.getConfiguration('ai-guardian.llm');
  const value = llmConfig.get<number>('maxAuditsPerFilePerHour', 5);
  if (!Number.isFinite(value)) {
    return 5;
  }

  return Math.min(200, Math.max(1, Math.floor(value)));
}

export function getLlmMaxPromptChars(): number {
  const llmConfig = vscode.workspace.getConfiguration('ai-guardian.llm');
  const value = llmConfig.get<number>('maxPromptChars', 4000);
  if (!Number.isFinite(value)) {
    return 4000;
  }

  return Math.min(50000, Math.max(500, Math.floor(value)));
}

export function isShadowModeEnabled(): boolean {
  const config = vscode.workspace.getConfiguration('ai-guardian.notifications');
  return config.get<boolean>('shadowMode', true);
}

export function isLocalTelemetryEnabled(): boolean {
  const config = vscode.workspace.getConfiguration('ai-guardian.metrics');
  return config.get<boolean>('enableLocalTelemetry', false);
}

export async function setLlmApiKey(apiKey: string): Promise<void> {
  await setStoredLlmApiKey(apiKey);
}

export async function setLlmProvider(provider: LlmProvider): Promise<void> {
  const llmConfig = vscode.workspace.getConfiguration('ai-guardian.llm');
  await llmConfig.update('provider', provider, vscode.ConfigurationTarget.Global);
}

export async function setLlmProfile(profile: LlmProfile): Promise<void> {
  const llmConfig = vscode.workspace.getConfiguration('ai-guardian.llm');
  await llmConfig.update('profile', profile, vscode.ConfigurationTarget.Global);
}

export async function setLlmModel(model: string): Promise<void> {
  const llmConfig = vscode.workspace.getConfiguration('ai-guardian.llm');
  await llmConfig.update('model', model, vscode.ConfigurationTarget.Global);
}

export async function clearAllLlmApiKeys(): Promise<void> {
  await deleteStoredLlmApiKey();
}
