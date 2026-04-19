import * as vscode from 'vscode';

const LLM_API_KEY_SECRET = 'ai-guardian.llm.apiKey';

let secretStorage: vscode.SecretStorage | undefined;

export function initializeSecretStorage(storage: vscode.SecretStorage): void {
  secretStorage = storage;
}

export async function getStoredLlmApiKey(): Promise<string | undefined> {
  if (!secretStorage) {
    return undefined;
  }

  const value = await secretStorage.get(LLM_API_KEY_SECRET);
  return value && value.trim().length > 0 ? value : undefined;
}

export async function setStoredLlmApiKey(apiKey: string): Promise<void> {
  if (!secretStorage) {
    throw new Error('SecretStorage no inicializado.');
  }

  await secretStorage.store(LLM_API_KEY_SECRET, apiKey);
}

export async function deleteStoredLlmApiKey(): Promise<void> {
  if (!secretStorage) {
    throw new Error('SecretStorage no inicializado.');
  }

  await secretStorage.delete(LLM_API_KEY_SECRET);
}
