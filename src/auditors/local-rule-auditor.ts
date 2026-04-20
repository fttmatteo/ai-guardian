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
    private compiledRules: { rule: Rule; regex: RegExp }[] = [];

    constructor() {
        this.loadRules();
    }

    public loadRules() {
        let rulesToLoad = [...DEFAULT_RULES];

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            const workspaceRoot = workspaceFolders[0].uri.fsPath;
            const workspaceRulesPath = path.join(workspaceRoot, 'rules.json');

            if (fs.existsSync(workspaceRulesPath)) {
                try {
                    const rulesContent = fs.readFileSync(workspaceRulesPath, 'utf-8');
                    const parsedRules = JSON.parse(rulesContent) as Rule[];

                    if (Array.isArray(parsedRules)) {
                        rulesToLoad = [...rulesToLoad, ...parsedRules];
                        Logger.log(`Se cargaron ${parsedRules.length} reglas adicionales desde rules.json.`);
                    } else {
                        Logger.error('rules.json debe contener un arreglo de reglas.');
                    }
                } catch (error) {
                    Logger.error('Error al parsear rules.json.', error);
                }
            }
        }

        this.compiledRules = [];
        for (const rule of rulesToLoad) {
            try {
                const regex = new RegExp(rule.pattern, 'ig');
                this.compiledRules.push({ rule, regex });
            } catch (error) {
                Logger.error(`Regex invalida precompilando regla local (${rule.id}).`, error);
            }
        }
    }

    public async audit(code: string, languageId: string): Promise<AuditResult[]> {
        const findings: AuditResult[] = [];
        if (this.compiledRules.length === 0 || !code) {
            return findings;
        }

        let lineStarts: number[] | null = null;
        
        const getLineNumber = (index: number): number => {
            if (!lineStarts) {
                lineStarts = [0];
                for (let i = 0; i < code.length; i++) {
                    if (code[i] === '\n') {
                        lineStarts.push(i + 1);
                    }
                }
            }
            
            let low = 0;
            let high = lineStarts.length - 1;
            while (low <= high) {
                const mid = (low + high) >> 1;
                if (lineStarts[mid] <= index) {
                    low = mid + 1;
                } else {
                    high = mid - 1;
                }
            }
            return high;
        };

        for (const { rule, regex } of this.compiledRules) {
            if (rule.language === 'any' || rule.language === languageId) {
                regex.lastIndex = 0;
                let match;
                while ((match = regex.exec(code)) !== null) {
                    findings.push({
                        risk: mapSeverityToRisk(rule.severity),
                        reason: rule.message,
                        fixSuggestion: 'Revise el código para eliminar el patrón detectado por la regla local.',
                        line: getLineNumber(match.index)
                    });
                }
            }
        }

        if (findings.length > 0) {
            Logger.log(`Hallazgos del auditor local: ${findings.length}.`);
        }

        return findings;
    }
}
