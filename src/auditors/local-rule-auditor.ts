import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Rule, AuditResult } from '../types/audit';
import { Logger } from '../core/logger';
import { DEFAULT_RULES } from '../config/default-rules';

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
        this.loadRules();
    }

    public loadRules() {
        // Siempre empezamos con las reglas integradas de "fabrica"
        this.rules = [...DEFAULT_RULES];

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            // Sin workspace, nos quedamos solo con las reglas por defecto
            return;
        }

        const workspaceRoot = workspaceFolders[0].uri.fsPath;
        const workspaceRulesPath = path.join(workspaceRoot, 'rules.json');

        if (!fs.existsSync(workspaceRulesPath)) {
            // No es un error ni advertencia; simplemente no hay reglas personalizadas
            return;
        }

        try {
            const rulesContent = fs.readFileSync(workspaceRulesPath, 'utf-8');
            const parsedRules = JSON.parse(rulesContent) as Rule[];

            if (!Array.isArray(parsedRules)) {
                Logger.error('rules.json debe contener un arreglo de reglas.');
                return;
            }

            // Mezclamos las reglas del usuario con las de por defecto
            this.rules = [...this.rules, ...parsedRules];
            Logger.log(`Se cargaron ${parsedRules.length} reglas adicionales desde rules.json.`);
        } catch (error) {
            Logger.error('Error al parsear rules.json.', error);
        }
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
