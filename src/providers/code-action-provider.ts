import * as vscode from 'vscode';
import { codeReplacementMap } from './diagnostic-provider';

export class SecurityActionProvider implements vscode.CodeActionProvider {
    
    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix
    ];

    public provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.CodeAction[] {
        
        const aiGuardianDiagnostics = context.diagnostics.filter(
            diagnostic => diagnostic.source === 'AI Guardian'
        );

        if (aiGuardianDiagnostics.length === 0) {
            return [];
        }

        const actions: vscode.CodeAction[] = [];

        for (const diagnostic of aiGuardianDiagnostics) {
            const codeReplacement = codeReplacementMap.get(diagnostic);
            
            if (codeReplacement) {
                const action = this.createFixAction(document, diagnostic, codeReplacement);
                actions.push(action);
            }
        }

        return actions;
    }

    private createFixAction(document: vscode.TextDocument, diagnostic: vscode.Diagnostic, codeReplacement: string): vscode.CodeAction {
        const action = new vscode.CodeAction('AI Guardian: Aplicar solución automática', vscode.CodeActionKind.QuickFix);
        
        action.edit = new vscode.WorkspaceEdit();
        
        action.edit.replace(document.uri, diagnostic.range, codeReplacement);
        
        action.diagnostics = [diagnostic];
        action.isPreferred = true;
        
        return action;
    }
}
