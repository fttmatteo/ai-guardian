import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { XMLParser } from 'fast-xml-parser';
import { AuditResult } from '../types/audit';
import { Logger } from '../core/logger';

interface JacocoReport {
    package: JacocoPackage[];
}
interface JacocoPackage {
    '@_name': string;
    class: JacocoClass[];
}
interface JacocoClass {
    '@_name': string;
    method: JacocoMethod[];
}
interface JacocoMethod {
    '@_name': string;
    '@_desc': string;
    counter: JacocoCounter[];
}
interface JacocoCounter {
    '@_type': 'INSTRUCTION' | 'LINE' | 'BRANCH' | 'METHOD';
    '@_missed': string;
    '@_covered': string;
}


export class JacocoService {
    private report: JacocoReport | undefined;
    private reportPath: string = '';

    constructor() {
        this.findAndLoadReport();
    }

    private async findAndLoadReport() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return;
        }

        this.reportPath = path.join(workspaceFolders[0].uri.fsPath, 'target', 'site', 'jacoco', 'jacoco.xml');

        if (fs.existsSync(this.reportPath)) {
            try {
                const xmlContent = fs.readFileSync(this.reportPath, 'utf-8');
                const parser = new XMLParser({ ignoreAttributes: false });
                this.report = parser.parse(xmlContent).report as JacocoReport;
                Logger.log('Reporte JaCoCo cargado correctamente.');
            } catch (error) {
                Logger.error('Error al parsear el reporte JaCoCo.', error);
                this.report = undefined;
            }
        }
    }

    public async auditClassFromFile(document: vscode.TextDocument): Promise<AuditResult[]> {
        if (!this.report || document.languageId !== 'java') {
            return [];
        }

        const filePath = path.parse(document.fileName);
        const className = filePath.name;

        const findings: AuditResult[] = [];

        this.report.package?.forEach(pkg => {
            const foundClass = pkg.class?.find(c => c['@_name'].endsWith(`/${className}`));
            if (foundClass) {
                foundClass.method?.forEach(method => {
                    if (method['@_name'] === '<init>') {
                        return;
                    }

                    const instructionCounter = method.counter?.find(ctr => ctr['@_type'] === 'INSTRUCTION');
                    if (instructionCounter && parseInt(instructionCounter['@_missed']) > 0 && parseInt(instructionCounter['@_covered']) === 0) {
                        findings.push({
                            risk: 'bajo',
                            reason: `El método '${method['@_name']}' en la clase '${className}' parece no tener cobertura de tests.`,
                            fixSuggestion: 'Considere añadir tests unitarios para el nuevo código generado por la IA para asegurar su correcto funcionamiento y prevenir regresiones.'
                        });
                    }
                });
            }
        });
        
        return findings.length > 0 ? [findings[0]] : [];
    }
}
