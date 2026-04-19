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

export class DiagnosticProvider {
    private diagnosticCollection: vscode.DiagnosticCollection;

    constructor(context: vscode.ExtensionContext) {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('ai-guardian');
        context.subscriptions.push(this.diagnosticCollection);
    }

    public updateDiagnostics(document: vscode.TextDocument, results: AuditResult[], insertedRange: vscode.Range) {
        if (!results || results.length === 0) {
            this.diagnosticCollection.clear();
            return;
        }

        const diagnostics: vscode.Diagnostic[] = results.map(result => {
            const diagnostic = new vscode.Diagnostic(
                insertedRange,
                `${result.reason}\nSugerencia: ${result.fixSuggestion}`,
                mapRiskToSeverity(result.risk)
            );
            diagnostic.source = 'AI Guardian';
            return diagnostic;
        });

        this.diagnosticCollection.set(document.uri, diagnostics);
    }

    public clearDiagnostics(document: vscode.TextDocument) {
        this.diagnosticCollection.delete(document.uri);
    }
}
