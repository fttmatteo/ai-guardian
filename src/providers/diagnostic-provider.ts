import * as vscode from 'vscode';
import { AuditResult } from '../types/audit';

function mapRiskToSeverity(risk: AuditResult['risk']): vscode.DiagnosticSeverity {
    switch (risk) {
        case 'alto':
            return vscode.DiagnosticSeverity.Error;
        case 'medio':
            return vscode.DiagnosticSeverity.Warning;
        case 'bajo':
            return vscode.DiagnosticSeverity.Information;
    }
}

export const codeReplacementMap = new WeakMap<vscode.Diagnostic, string>();

export class DiagnosticProvider {
    private diagnosticCollection: vscode.DiagnosticCollection;

    constructor(context: vscode.ExtensionContext) {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('ai-guardian');
        context.subscriptions.push(this.diagnosticCollection);
    }

    public updateDiagnostics(document: vscode.TextDocument, results: AuditResult[], insertedRange: vscode.Range) {
        if (!results || results.length === 0) {
            this.diagnosticCollection.delete(document.uri);
            return;
        }

        const diagnostics: vscode.Diagnostic[] = results.map(result => {
            let targetRange = insertedRange;
            let isFullFileRange = targetRange.start.line === 0 && targetRange.end.line === document.lineCount;

            if (result.originalBlock) {
                const docText = document.getText();
                const startIndex = docText.indexOf(result.originalBlock);
                if (startIndex !== -1) {
                    targetRange = new vscode.Range(
                        document.positionAt(startIndex),
                        document.positionAt(startIndex + result.originalBlock.length)
                    );
                    isFullFileRange = false;
                }
            }

            if (isFullFileRange && result.line !== undefined && result.line < document.lineCount) {
                targetRange = document.lineAt(result.line).range;
                isFullFileRange = false;
            } else if (isFullFileRange) {
                targetRange = document.lineAt(0).range;
            }

            const diagnostic = new vscode.Diagnostic(
                targetRange,
                `${result.reason}\nSugerencia: ${result.fixSuggestion}`,
                mapRiskToSeverity(result.risk)
            );
            diagnostic.source = 'AI Guardian';
            
            if (result.codeReplacement && !isFullFileRange) {
                codeReplacementMap.set(diagnostic, result.codeReplacement);
            }
            
            return diagnostic;
        });

        this.diagnosticCollection.set(document.uri, diagnostics);
    }

    public clearDiagnostics(document: vscode.TextDocument) {
        this.diagnosticCollection.delete(document.uri);
    }
}
