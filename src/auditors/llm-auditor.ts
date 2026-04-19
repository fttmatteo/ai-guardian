import * as vscode from 'vscode';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getLlmApiKey, getLlmBaseUrl, getLlmMaxRetries, getLlmModel, getLlmProvider, getLlmTimeoutMs } from '../config/settings';
import { AuditResult } from '../types/audit';
import { ProjectContext } from '../core/project-context.service';
import { Logger } from '../core/logger';

const SYSTEM_PROMPT_TEMPLATE = `
Eres AI Guardian, un experto mundial en ciberseguridad y arquitectura de software. Tu unica funcion es analizar el siguiente fragmento de codigo generado por una IA, considerando que pertenece a un proyecto {CONTEXT}.

Tu analisis debe enfocarse exclusivamente en:
1.  **Vulnerabilidades de Seguridad:** (OWASP Top 10, CWE) como Inyeccion SQL, XSS, CSRF, manejo inseguro de datos.
2.  **"Alucinaciones" de la IA:** Uso de librerias o metodos que no existen o son inapropiados para el framework.
3.  **Malas Practicas Graves:** Falta de manejo de errores, comunicacion sin cifrar, logica de negocio incompleta.

Responde unicamente en formato JSON, dentro de un bloque de codigo markdown. Si no encuentras riesgos, devuelve un array vacio.

Formato de respuesta:
\`\`\`json
[
  {
    "risk": "alto" | "medio" | "bajo",
    "reason": "Una explicacion concisa y tecnica del problema.",
    "fixSuggestion": "Una recomendacion clara y accionable para corregir el fallo."
  }
]
\`\`\`
`;

export class LlmAuditor {
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
        let timeoutHandle: NodeJS.Timeout | undefined;
        const timeoutPromise = new Promise<never>((_, reject) => {
            timeoutHandle = setTimeout(() => {
                reject(new Error(`TIEMPO_ESPERA: Se excedio el tiempo de espera (${timeoutMs} ms).`));
            }, timeoutMs);
        });

        try {
            return await Promise.race([operation, timeoutPromise]);
        } finally {
            if (timeoutHandle) {
                clearTimeout(timeoutHandle);
            }
        }
    }

    private classifyError(error: unknown): { type: string; retryable: boolean; userMessage: string; technicalMessage: string } {
        const message = error instanceof Error ? error.message : String(error);

        if (message.includes('TIEMPO_ESPERA')) {
            return {
                type: 'timeout',
                retryable: true,
                userMessage: 'AI Guardian: El proveedor LLM excedio el tiempo de espera. Intenta nuevamente o aumenta ai-guardian.llm.timeoutMs.',
                technicalMessage: message
            };
        }

        if (/HTTP[_\s:]?(401|403)|\b401\b|\b403\b/.test(message)) {
            return {
                type: 'auth',
                retryable: false,
                userMessage: 'AI Guardian: Error de autenticacion con el proveedor LLM. Verifica tu API key BYOK.',
                technicalMessage: message
            };
        }

        if (/HTTP[_\s:]?429|\b429\b/.test(message)) {
            return {
                type: 'rate_limit',
                retryable: true,
                userMessage: 'AI Guardian: Limite de solicitudes del proveedor LLM alcanzado (429).',
                technicalMessage: message
            };
        }

        if (/HTTP[_\s:]?5\d\d|\b5\d\d\b/.test(message)) {
            return {
                type: 'server',
                retryable: true,
                userMessage: 'AI Guardian: El proveedor LLM tuvo un error interno (5xx).',
                technicalMessage: message
            };
        }

        if (/fetch failed|network|ECONN|ENOTFOUND|EAI_AGAIN|socket|ETIMEDOUT/i.test(message)) {
            return {
                type: 'network',
                retryable: true,
                userMessage: 'AI Guardian: Error de red al contactar el proveedor LLM.',
                technicalMessage: message
            };
        }

        return {
            type: 'unknown',
            retryable: false,
            userMessage: 'AI Guardian: Ocurrio un error inesperado con el proveedor LLM.',
            technicalMessage: message
        };
    }

    private async runWithRetry<T>(operationFactory: () => Promise<T>, maxRetries: number, timeoutMs: number): Promise<T> {
        let attempt = 0;

        while (true) {
            try {
                return await this.withTimeout(operationFactory(), timeoutMs);
            } catch (error) {
                const classified = this.classifyError(error);
                const hasMoreAttempts = attempt < maxRetries;

                if (!classified.retryable || !hasMoreAttempts) {
                    throw error;
                }

                const waitMs = 500 * Math.pow(2, attempt);
                Logger.warn(`Fallo transitorio (${classified.type}) en llamada LLM. Reintentando en ${waitMs} ms (intento ${attempt + 2}/${maxRetries + 1}).`);
                await this.sleep(waitMs);
                attempt += 1;
            }
        }
    }

    private extractJsonArray(text: string): string | undefined {
        const fencedMatch = text.match(/```json\s*([\s\S]*?)\s*```/i);
        if (fencedMatch && fencedMatch[1]) {
            return fencedMatch[1];
        }

        const plainArrayMatch = text.match(/\[[\s\S]*\]/);
        return plainArrayMatch ? plainArrayMatch[0] : undefined;
    }

    private buildFullPrompt(code: string, projectContext: ProjectContext): string {
        const prompt = SYSTEM_PROMPT_TEMPLATE.replace('{CONTEXT}', projectContext);
        return `${prompt}\n\nAnaliza este codigo:\n\`\`\`\n${code}\n\`\`\``;
    }

    private async callGemini(apiKey: string, modelName: string, fullPrompt: string): Promise<string> {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        return response.text();
    }

    private async callOpenAi(apiKey: string, modelName: string, fullPrompt: string, timeoutMs: number, baseUrl?: string): Promise<string> {
        const endpoint = `${baseUrl ?? 'https://api.openai.com'}/v1/chat/completions`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            signal: controller.signal,
            body: JSON.stringify({
                model: modelName,
                messages: [
                    {
                        role: 'user',
                        content: fullPrompt
                    }
                ],
                temperature: 0
            })
        });

        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(`OPENAI_HTTP_${response.status}: ${await response.text()}`);
        }

        const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
        return payload.choices?.[0]?.message?.content ?? '';
    }

    private async callClaude(apiKey: string, modelName: string, fullPrompt: string, timeoutMs: number, baseUrl?: string): Promise<string> {
        const endpoint = `${baseUrl ?? 'https://api.anthropic.com'}/v1/messages`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            signal: controller.signal,
            body: JSON.stringify({
                model: modelName,
                max_tokens: 2048,
                temperature: 0,
                messages: [
                    {
                        role: 'user',
                        content: fullPrompt
                    }
                ]
            })
        });

        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(`CLAUDE_HTTP_${response.status}: ${await response.text()}`);
        }

        const payload = await response.json() as { content?: Array<{ type?: string; text?: string }> };
        const textBlocks = payload.content?.filter(block => block.type === 'text').map(block => block.text ?? '') ?? [];
        return textBlocks.join('\n');
    }

    public async audit(code: string, projectContext: ProjectContext): Promise<AuditResult[]> {
        const provider = getLlmProvider();
        const modelName = getLlmModel(provider);
        const baseUrl = getLlmBaseUrl();
        const timeoutMs = getLlmTimeoutMs();
        const maxRetries = getLlmMaxRetries();
        const apiKey = await getLlmApiKey();

        if (!apiKey) {
            Logger.warn('No hay API key configurada para el proveedor LLM. Se omite la auditoria. Configura ai-guardian.llm.apiKey en ajustes (o claves legacy por proveedor).');
            return [];
        }

        try {
            const fullPrompt = this.buildFullPrompt(code, projectContext);
            let text = '';

            if (provider === 'gemini') {
                text = await this.runWithRetry(() => this.callGemini(apiKey, modelName, fullPrompt), maxRetries, timeoutMs);
            } else if (provider === 'openai') {
                text = await this.runWithRetry(() => this.callOpenAi(apiKey, modelName, fullPrompt, timeoutMs, baseUrl), maxRetries, timeoutMs + 1000);
            } else if (provider === 'claude') {
                text = await this.runWithRetry(() => this.callClaude(apiKey, modelName, fullPrompt, timeoutMs, baseUrl), maxRetries, timeoutMs + 1000);
            } else {
                Logger.warn(`Proveedor LLM no soportado actualmente: ${provider}. Se omite la auditoria LLM.`);
                return [];
            }

            const rawJson = this.extractJsonArray(text);
            if (!rawJson) {
                Logger.error('Respuesta JSON invalida del proveedor LLM.', text);
                return [];
            }

            const jsonResponse = JSON.parse(rawJson);
            if (!Array.isArray(jsonResponse)) {
                Logger.warn('El proveedor LLM devolvio una respuesta JSON que no es un arreglo. Se ignora el resultado.');
                return [];
            }

            return jsonResponse as AuditResult[];

        } catch (error) {
            const classified = this.classifyError(error);
            Logger.error(`Error durante la llamada al proveedor LLM (${classified.type}).`, classified.technicalMessage);
            vscode.window.showErrorMessage(classified.userMessage);
            return [];
        }
    }
}
