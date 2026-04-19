import * as vscode from 'vscode';
import { detectAiCodeInsertion } from './core/change-detector';
import { ProjectContextService } from './core/project-context.service';
import { LocalRuleAuditor } from './auditors/local-rule-auditor';
import { LlmAuditor } from './auditors/llm-auditor';
import { DiagnosticProvider } from './providers/diagnostic-provider';
import { JacocoService } from './integrations/jacoco.service';
import { AuditResult } from './types/audit';
import { Logger } from './core/logger';
import { clearAllLlmApiKeys, getLlmApiKey, getLlmBaseUrl, getLlmMaxAuditsPerFilePerHour, getLlmMaxCallsPerHour, getLlmMaxPromptChars, getLlmMaxRetries, getLlmModel, getLlmProfile, getLlmProvider, getLlmTimeoutMs, getRecommendedModels, isLocalTelemetryEnabled, isShadowModeEnabled, LlmProfile, LlmProvider, setLlmApiKey, setLlmModel, setLlmProfile, setLlmProvider } from './config/settings';
import { initializeSecretStorage } from './core/secret-storage';
import { LlmUsageGuard, LlmUsageState } from './core/llm-usage-guard';

const SUPPORTED_LANGUAGES = new Set([
    'java',
    'javascript',
    'typescript',
    'javascriptreact',
    'typescriptreact',
    'python'
]);

function shouldAuditDocument(document: vscode.TextDocument): boolean {
    if (document.uri.scheme !== 'file') {
        return false;
    }


    const language = document.languageId.toLowerCase();
    if (language === 'log' || language === 'output' || language === 'plaintext') {
        return false;
    }

    return SUPPORTED_LANGUAGES.has(language);
}

export function activate(context: vscode.ExtensionContext) {
    initializeSecretStorage(context.secrets);

    Logger.initialize('AI Guardian');
    Logger.log('La extension "ai-guardian" esta activa.');

    const projectContextService = new ProjectContextService();
    const localAuditor = new LocalRuleAuditor();
    const llmAuditor = new LlmAuditor();
    const llmUsageGuard = new LlmUsageGuard();
    const jacocoService = new JacocoService();
    const diagnosticProvider = new DiagnosticProvider(context);
    const onboardingState = context.globalState;
    const usageStateKey = 'ai-guardian.llm.usageState';
    const telemetryStateKey = 'ai-guardian.metrics.localTelemetry';

    context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(() => {
        Logger.log('Cambio en carpetas del workspace detectado. Recargando contexto y reglas...');
        projectContextService.refreshContext();
        localAuditor.loadRules();
    }));

    type LocalTelemetryState = {
        totalAudits: number;
        llmCalls: number;
        quotaSkips: number;
        promptTruncations: number;
        lastUpdated: string;
    };

    const defaultTelemetry: LocalTelemetryState = {
        totalAudits: 0,
        llmCalls: 0,
        quotaSkips: 0,
        promptTruncations: 0,
        lastUpdated: ''
    };

    const persistUsageState = () => {
        const state = llmUsageGuard.exportState();
        void onboardingState.update(usageStateKey, state).then(undefined, (error: unknown) => {
            Logger.error('No se pudo persistir el estado de cuota LLM.', error);
        });
    };

    const bumpTelemetry = (field: keyof Omit<LocalTelemetryState, 'lastUpdated'>) => {
        if (!isLocalTelemetryEnabled()) {
            return;
        }

        const current = onboardingState.get<LocalTelemetryState>(telemetryStateKey, defaultTelemetry);
        const updated: LocalTelemetryState = {
            ...current,
            [field]: current[field] + 1,
            lastUpdated: new Date().toISOString()
        };

        void onboardingState.update(telemetryStateKey, updated).then(undefined, (error: unknown) => {
            Logger.error('No se pudo actualizar telemetria local.', error);
        });
    };

    llmUsageGuard.hydrate(onboardingState.get<LlmUsageState>(usageStateKey));

    const configurarByokCommand = vscode.commands.registerCommand('ai-guardian.configurarByok', async () => {
        const currentProvider = getLlmProvider();
        const currentProfile = getLlmProfile();
        const providerOptions: Array<{ label: string; value: LlmProvider }> = [
            { label: 'Gemini', value: 'gemini' },
            { label: 'OpenAI', value: 'openai' },
            { label: 'Claude', value: 'claude' }
        ];

        const profileOptions: Array<{ label: string; value: LlmProfile; description: string }> = [
            { label: 'Free', value: 'free', description: 'Menor costo y menor consumo de cuota' },
            { label: 'Balanced', value: 'balanced', description: 'Equilibrio entre costo y profundidad' },
            { label: 'Deep', value: 'deep', description: 'Mayor profundidad de analisis' }
        ];

        const picked = await vscode.window.showQuickPick(
            providerOptions.map(option => ({
                label: option.label,
                value: option.value,
                description: option.value === currentProvider ? 'Actual' : undefined
            })),
            {
                placeHolder: 'Selecciona el proveedor LLM para BYOK'
            }
        );

        if (!picked) {
            return;
        }

        const pickedProfile = await vscode.window.showQuickPick(
            profileOptions.map(option => ({
                label: option.label,
                value: option.value,
                description: `${option.description}${option.value === currentProfile ? ' (Actual)' : ''}`
            })),
            {
                placeHolder: 'Selecciona el perfil de uso LLM'
            }
        );

        if (!pickedProfile) {
            return;
        }

        const recommendedModels = getRecommendedModels(picked.value, pickedProfile.value);
        const pickedModel = await vscode.window.showQuickPick(
            [
                ...recommendedModels.map(model => ({
                    label: model,
                    value: model,
                    description: 'Recomendado por perfil'
                })),
                {
                    label: 'Otro (personalizado)',
                    value: '__custom__',
                    description: 'Especificar manualmente el modelo'
                }
            ],
            {
                placeHolder: 'Selecciona un modelo sugerido'
            }
        );

        if (!pickedModel) {
            return;
        }

        let modelToSave = pickedModel.value;
        if (pickedModel.value === '__custom__') {
            const customModel = await vscode.window.showInputBox({
                prompt: 'Ingresa el nombre exacto del modelo',
                placeHolder: 'Ejemplo: nombre-del-modelo',
                ignoreFocusOut: true,
                validateInput: value => (!value || value.trim().length < 3 ? 'Ingresa un nombre de modelo valido.' : null)
            });

            if (!customModel) {
                return;
            }

            modelToSave = customModel.trim();
        }

        const apiKey = await vscode.window.showInputBox({
            prompt: `Ingresa tu API key para ${picked.label}`,
            placeHolder: 'Pega aqui tu API key',
            password: true,
            ignoreFocusOut: true,
            validateInput: (value) => {
                if (!value || value.trim().length < 10) {
                    return 'La API key parece invalida o demasiado corta.';
                }
                return null;
            }
        });

        if (!apiKey) {
            return;
        }

        await setLlmProvider(picked.value);
        await setLlmProfile(pickedProfile.value);
        await setLlmModel(modelToSave);
        await setLlmApiKey(apiKey.trim());
        Logger.log(`BYOK configurado para proveedor ${picked.value}, perfil ${pickedProfile.value}, modelo ${modelToSave}.`);
        vscode.window.showInformationMessage(`AI Guardian: BYOK configurado para ${picked.label} (${pickedProfile.label}) con modelo ${modelToSave}.`);
    });
    context.subscriptions.push(configurarByokCommand);

    const limpiarByokCommand = vscode.commands.registerCommand('ai-guardian.limpiarByok', async () => {
        const confirmation = await vscode.window.showWarningMessage(
            'Se eliminaran todas las API keys BYOK guardadas en SecretStorage.',
            { modal: true },
            'Eliminar',
            'Cancelar'
        );

        if (confirmation !== 'Eliminar') {
            return;
        }

        await clearAllLlmApiKeys();
        Logger.log('Se eliminaron todas las API keys BYOK guardadas.');
        vscode.window.showInformationMessage('AI Guardian: API keys BYOK eliminadas correctamente.');
    });
    context.subscriptions.push(limpiarByokCommand);

    const estadoByokCommand = vscode.commands.registerCommand('ai-guardian.estadoByok', async () => {
        const provider = getLlmProvider();
        const profile = getLlmProfile();
        const model = getLlmModel(provider);
        const baseUrl = getLlmBaseUrl() ?? 'default del proveedor';
        const timeoutMs = getLlmTimeoutMs();
        const maxRetries = getLlmMaxRetries();
        const maxCallsPerHour = getLlmMaxCallsPerHour();
        const maxAuditsPerFilePerHour = getLlmMaxAuditsPerFilePerHour();
        const maxPromptChars = getLlmMaxPromptChars();
        const apiKeyConfigured = Boolean(await getLlmApiKey());
        const activeEditor = vscode.window.activeTextEditor;
        const activeFileKey = activeEditor?.document.uri.toString();
        const usage = activeFileKey
            ? llmUsageGuard.getUsageSnapshot(activeFileKey)
            : { globalCallsLastHour: 0, fileCallsLastHour: 0 };
        const telemetryEnabled = isLocalTelemetryEnabled();
        const telemetry = onboardingState.get<LocalTelemetryState>(telemetryStateKey, defaultTelemetry);

        const usageFileLabel = activeEditor?.document.fileName ?? 'sin archivo activo';

        const statusLines = [
            `Proveedor: ${provider}`,
            `Perfil: ${profile}`,
            `Modelo: ${model}`,
            `Base URL: ${baseUrl}`,
            `Timeout: ${timeoutMs} ms`,
            `Reintentos: ${maxRetries}`,
            `API key configurada: ${apiKeyConfigured ? 'si' : 'no'}`,
            `Limite global/hora: ${usage.globalCallsLastHour}/${maxCallsPerHour}`,
            `Limite por archivo/hora: ${usage.fileCallsLastHour}/${maxAuditsPerFilePerHour}`,
            `Max prompt chars: ${maxPromptChars}`,
            `Archivo de referencia: ${usageFileLabel}`
        ];

        if (telemetryEnabled) {
            statusLines.push(`Telemetria local: activa`);
            statusLines.push(`Auditorias totales: ${telemetry.totalAudits}`);
            statusLines.push(`Llamadas LLM contabilizadas: ${telemetry.llmCalls}`);
            statusLines.push(`Omisiones por cuota: ${telemetry.quotaSkips}`);
            statusLines.push(`Truncamientos de prompt: ${telemetry.promptTruncations}`);
        } else {
            statusLines.push('Telemetria local: inactiva');
        }

        vscode.window.showInformationMessage(`AI Guardian BYOK\n${statusLines.join('\n')}`);
        Logger.log(`Estado BYOK consultado: provider=${provider}, profile=${profile}, model=${model}, key=${apiKeyConfigured ? 'si' : 'no'}, usoGlobal=${usage.globalCallsLastHour}/${maxCallsPerHour}.`);
    });
    context.subscriptions.push(estadoByokCommand);

    const estadoCuotaPanelCommand = vscode.commands.registerCommand('ai-guardian.estadoCuotaPanel', async () => {
        const provider = getLlmProvider();
        const profile = getLlmProfile();
        const model = getLlmModel(provider);
        const maxCallsPerHour = getLlmMaxCallsPerHour();
        const maxAuditsPerFilePerHour = getLlmMaxAuditsPerFilePerHour();
        const maxPromptChars = getLlmMaxPromptChars();
        const telemetryEnabled = isLocalTelemetryEnabled();
        const telemetry = onboardingState.get<LocalTelemetryState>(telemetryStateKey, defaultTelemetry);
        const usageState = llmUsageGuard.exportState();

        const activeEditor = vscode.window.activeTextEditor;
        const activeFileKey = activeEditor?.document.uri.toString();
        const activeUsage = activeFileKey
            ? llmUsageGuard.getUsageSnapshot(activeFileKey)
            : { globalCallsLastHour: usageState.globalCalls.length, fileCallsLastHour: 0 };

        const formatFileLabel = (fileKey: string): string => {
            try {
                const uri = vscode.Uri.parse(fileKey);
                if (uri.scheme === 'file') {
                    return uri.fsPath;
                }
            } catch {
                // Ignorar parseos invalidos y mostrar clave original.
            }

            return fileKey;
        };

        const topFiles = Object.entries(usageState.fileCalls)
            .map(([fileKey, calls]) => ({ fileKey, count: calls.length }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8);

        const topFilesHtml = topFiles.length > 0
            ? topFiles.map(item => `<tr><td>${formatFileLabel(item.fileKey)}</td><td>${item.count}</td></tr>`).join('')
            : '<tr><td colspan="2">Sin datos aun</td></tr>';

        const telemetryHtml = telemetryEnabled
            ? `
                <li><strong>Auditorias totales:</strong> ${telemetry.totalAudits}</li>
                <li><strong>Llamadas LLM contabilizadas:</strong> ${telemetry.llmCalls}</li>
                <li><strong>Omisiones por cuota:</strong> ${telemetry.quotaSkips}</li>
                <li><strong>Truncamientos de prompt:</strong> ${telemetry.promptTruncations}</li>
                <li><strong>Ultima actualizacion:</strong> ${telemetry.lastUpdated || 'N/A'}</li>
            `
            : '<li>Telemetria local desactivada (ai-guardian.metrics.enableLocalTelemetry=false)</li>';

        const panel = vscode.window.createWebviewPanel(
            'aiGuardianQuotaStatus',
            'AI Guardian: Estado de cuota',
            vscode.ViewColumn.Active,
            { enableFindWidget: true }
        );

        panel.webview.html = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>AI Guardian - Estado de cuota</title>
                <style>
                    body { font-family: Verdana, sans-serif; padding: 16px; color: #222; }
                    h1 { margin-top: 0; font-size: 20px; }
                    h2 { margin-bottom: 8px; font-size: 16px; }
                    .card { border: 1px solid #ddd; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
                    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }
                    ul { margin: 0; padding-left: 18px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background: #f4f4f4; }
                    .muted { color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <h1>AI Guardian - Estado de cuota y consumo</h1>

                <div class="grid">
                    <section class="card">
                        <h2>Configuracion activa</h2>
                        <ul>
                            <li><strong>Proveedor:</strong> ${provider}</li>
                            <li><strong>Perfil:</strong> ${profile}</li>
                            <li><strong>Modelo:</strong> ${model}</li>
                            <li><strong>Max llamadas/hora:</strong> ${maxCallsPerHour}</li>
                            <li><strong>Max auditorias por archivo/hora:</strong> ${maxAuditsPerFilePerHour}</li>
                            <li><strong>Max prompt chars:</strong> ${maxPromptChars}</li>
                        </ul>
                    </section>

                    <section class="card">
                        <h2>Consumo actual</h2>
                        <ul>
                            <li><strong>Llamadas globales (ultima hora):</strong> ${activeUsage.globalCallsLastHour}/${maxCallsPerHour}</li>
                            <li><strong>Archivo activo (ultima hora):</strong> ${activeUsage.fileCallsLastHour}/${maxAuditsPerFilePerHour}</li>
                            <li><strong>Archivo activo:</strong> ${activeEditor?.document.fileName ?? 'Sin archivo activo'}</li>
                        </ul>
                    </section>
                </div>

                <section class="card">
                    <h2>Top archivos por consumo (ultima hora)</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Archivo</th>
                                <th>Llamadas</th>
                            </tr>
                        </thead>
                        <tbody>${topFilesHtml}</tbody>
                    </table>
                </section>

                <section class="card">
                    <h2>Telemetria local</h2>
                    <ul>${telemetryHtml}</ul>
                </section>

                <p class="muted">Los datos reflejan el estado persistido localmente por AI Guardian.</p>
            </body>
            </html>
        `;

        Logger.log('Panel de estado de cuota abierto.');
    });
    context.subscriptions.push(estadoCuotaPanelCommand);

    void getLlmApiKey().then(async apiKey => {
        const alreadyPrompted = onboardingState.get<boolean>('ai-guardian.onboarding.promptedOnce', false);
        if (!apiKey && !alreadyPrompted) {
            const selection = await vscode.window.showInformationMessage(
                'AI Guardian (BYOK): configura proveedor y API key para habilitar auditoria LLM.',
                'Configurar ahora',
                'Ver estado BYOK',
                'Mas tarde'
            );

            if (selection === 'Configurar ahora') {
                await vscode.commands.executeCommand('ai-guardian.configurarByok');
            } else if (selection === 'Ver estado BYOK') {
                await vscode.commands.executeCommand('ai-guardian.estadoByok');
            }

            await onboardingState.update('ai-guardian.onboarding.promptedOnce', true);
        }
    });

    const auditCurrentFile = async (document: vscode.TextDocument, insertedCode?: string, insertedRange?: vscode.Range) => {
        if (!shouldAuditDocument(document)) {
            return;
        }

        const isInsertion = !!insertedCode;
        const codeToAudit = isInsertion ? insertedCode! : document.getText();
        const baseRange = insertedRange || new vscode.Range(0, 0, document.lineCount, 0);

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: isInsertion ? "AI Guardian: Analizando insercion..." : "AI Guardian: Auditando archivo...",
            cancellable: false
        }, async (progress) => {
            const languageId = document.languageId;
            const projectContext = projectContextService.getEffectiveContext(languageId);

            Logger.log(`Iniciando auditoria (${isInsertion ? 'Insercion' : 'Archivo'}). Lenguaje: ${languageId}, Contexto: ${projectContext}.`);
            
            // 1. Auditoria Local (Siempre sobre lo que queremos auditar)
            const localFindings = await localAuditor.audit(codeToAudit, languageId);
            
            // 2. Auditoria LLM (Solo si es una insercion detectada, para optimizar cuota)
            let llmFindings: AuditResult[] = [];
            if (isInsertion) {
                const maxPromptChars = getLlmMaxPromptChars();
                const llmSnippet = codeToAudit.length > maxPromptChars
                    ? `${codeToAudit.slice(0, maxPromptChars)}\n\n/* Truncado por maxPromptChars (${maxPromptChars}) */`
                    : codeToAudit;

                const fileKey = document.uri.toString();
                const usageDecision = llmUsageGuard.canCall(
                    fileKey,
                    getLlmMaxCallsPerHour(),
                    getLlmMaxAuditsPerFilePerHour()
                );

                if (usageDecision.allowed) {
                    llmFindings = await llmAuditor.audit(llmSnippet, projectContext);
                    llmUsageGuard.recordCall(fileKey);
                    persistUsageState();
                    bumpTelemetry('llmCalls');
                } else {
                    Logger.warn(`Se omite auditoria LLM por control de cuota: ${usageDecision.reason}`);
                }
            }

            const allFindings = [...localFindings, ...llmFindings];
            
            if (allFindings.length > 0) {
                diagnosticProvider.updateDiagnostics(document, allFindings, baseRange);
                
                const shadowMode = isShadowModeEnabled();
                const hasHighRisk = allFindings.some(f => f.risk === 'alto');

                if (!shadowMode || hasHighRisk) {
                    vscode.window.showWarningMessage(`AI Guardian encontró ${allFindings.length} riesgo(s) potencial(es).`);
                }
            } else {
                diagnosticProvider.clearDiagnostics(document);
            }
            
            Logger.log(`Auditoria finalizada. Hallazgos: ${allFindings.length}`);
        });
    };

    // Comando Manual
    const auditManualCommand = vscode.commands.registerCommand('ai-guardian.auditManual', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            await auditCurrentFile(editor.document);
        }
    });
    context.subscriptions.push(auditManualCommand);

    let auditTimeout: NodeJS.Timeout | undefined;

    vscode.workspace.onDidChangeTextDocument(event => {
        if (!shouldAuditDocument(event.document)) {
            return;
        }

        if (auditTimeout) {
            clearTimeout(auditTimeout);
        }

        auditTimeout = setTimeout(async () => {
            const insertedCode = detectAiCodeInsertion(event);
            if (insertedCode && event.contentChanges.length > 0) {
                const change = event.contentChanges[0];
                const insertedRange = new vscode.Range(change.range.start, change.range.end.translate(0, change.text.length));
                await auditCurrentFile(event.document, insertedCode, insertedRange);
            }
        }, 1500);
    });

    vscode.workspace.onDidOpenTextDocument(document => {
        void auditCurrentFile(document);
    });

    vscode.workspace.onDidSaveTextDocument(document => {
        void auditCurrentFile(document);
    });

    vscode.workspace.onDidCloseTextDocument(document => {
        diagnosticProvider.clearDiagnostics(document);
    });
}

export function deactivate() {}
