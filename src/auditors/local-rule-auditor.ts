import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Rule, AuditResult } from '../types/audit';
import { Logger } from '../core/logger';

const DEFAULT_RULES: Rule[] = [
    {
        id: 'generic-hardcoded-secret',
        language: 'any',
        pattern: '(?:secret|password|api[_-]?key|token)\\s*[:=]\\s*[\'\"][^\'\"]+[\'\"]',
        message: 'AI Guardian: Se detectó una credencial codificada en el código. Considere usar variables de entorno o un gestor de secretos.',
        severity: 'CRITICAL'
    },
    {
        id: 'java-raw-sql-execute',
        language: 'java',
        pattern: '\\.execute(?:Update|Query)?\\s*\\(\\s*[\'\"]\\s*(SELECT|INSERT|UPDATE|DELETE)',
        message: 'AI Guardian: Se detectó SQL crudo en ejecución directa. Considere PreparedStatement o capas Repository/ORM.',
        severity: 'HIGH'
    },
    {
        id: 'java-sql-string-concat',
        language: 'java',
        pattern: '(SELECT|INSERT|UPDATE|DELETE)[^\\n;]*\\+\\s*\\w+',
        message: 'AI Guardian: Se detectó construcción de SQL por concatenación. Riesgo de inyección SQL.',
        severity: 'HIGH'
    }
];

function mapSeverityToRisk(severity: Rule['severity']): AuditResult['risk'] {
    switch (severity) {
        case 'CRITICAL':
        case 'HIGH':
            return 'alto';
        case 'MEDIUM':
            return 'medio';
        case 'LOW':
            return 'bajo';
    }
}

export class LocalRuleAuditor {
    private rules: Rule[] = [];

    constructor() {
        this.rules = [...DEFAULT_RULES];
        this.loadRules();
    }

    private loadRules() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            const workspaceRoot = workspaceFolders[0].uri.fsPath;
            const workspaceRulesPath = path.join(workspaceRoot, 'rules.json');
            if (fs.existsSync(workspaceRulesPath)) {
                try {
                    const rulesContent = fs.readFileSync(workspaceRulesPath, 'utf-8');
                    const customRules = JSON.parse(rulesContent) as Rule[];
                    this.rules = [...DEFAULT_RULES, ...customRules];
                    Logger.log(`Se cargaron ${customRules.length} reglas personalizadas del workspace (total activas: ${this.rules.length}).`);
                    return;
                } catch (error) {
                    Logger.error('Error al parsear rules.json personalizado. Se usaran reglas locales por defecto.', error);
                }
            }
        }

        Logger.warn(`No se cargaron reglas personalizadas. Se usan reglas locales por defecto (${this.rules.length}).`);
    }

    public async audit(code: string, languageId: string): Promise<AuditResult[]> {
        const findings: AuditResult[] = [];
        if (this.rules.length === 0) {
            return findings;
        }

        for (const rule of this.rules) {
            if (rule.language === 'any' || rule.language === languageId) {
                try {
                    const regex = new RegExp(rule.pattern, 'i');
                    if (regex.test(code)) {
                        findings.push({
                            risk: mapSeverityToRisk(rule.severity),
                            reason: rule.message,
                            fixSuggestion: 'Revise el código para eliminar el patrón detectado por la regla local.'
                        });
                    }
                } catch (error) {
                    Logger.error(`Regex invalida en regla local (${rule.id}).`, error);
                }
            }
        }

        if (findings.length > 0) {
            Logger.log(`Hallazgos del auditor local: ${findings.length}.`);
        }

        return findings;
    }
}
