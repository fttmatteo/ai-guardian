import * as assert from 'assert';
import * as vscode from 'vscode';
import { SecurityActionProvider } from '../../providers/code-action-provider';
import { codeReplacementMap } from '../../providers/diagnostic-provider';

suite('Security Action Provider', () => {
    let provider: SecurityActionProvider;

    setup(() => {
        provider = new SecurityActionProvider();
    });

    test('retorna vacio si no hay diagnosticos de AI Guardian', () => {
        const dummyDocument = {} as vscode.TextDocument;
        const dummyRange = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 5));
        
        const context: vscode.CodeActionContext = {
            diagnostics: [
                new vscode.Diagnostic(dummyRange, 'Un error X', vscode.DiagnosticSeverity.Error)
            ] as vscode.Diagnostic[],
            only: vscode.CodeActionKind.QuickFix,
            triggerKind: vscode.CodeActionTriggerKind.Invoke
        };

        const actions = provider.provideCodeActions(dummyDocument, dummyRange, context, {} as vscode.CancellationToken);
        
        assert.strictEqual(actions.length, 0, 'No debería proveer acciones para diagnosticos ajenos a la extensión.');
    });

    test('reacciona correctamente, inyecta WorkspaceEdit y consume WeakMap para Fixes con AI', () => {
        const dummyDocument = { uri: vscode.Uri.file('/fake/path/test.js') } as vscode.TextDocument;
        const dummyRange = new vscode.Range(new vscode.Position(2, 0), new vscode.Position(2, 20));
        
        const diagnostic = new vscode.Diagnostic(dummyRange, 'Ataque SSRF Detectado', vscode.DiagnosticSeverity.Warning);
        diagnostic.source = 'AI Guardian';
        
        const fakeFix = 'const secureRequest = useHttps();';
        codeReplacementMap.set(diagnostic, fakeFix);

        const context: vscode.CodeActionContext = {
            diagnostics: [diagnostic],
            only: undefined,
            triggerKind: vscode.CodeActionTriggerKind.Invoke
        };

        const actions = provider.provideCodeActions(dummyDocument, dummyRange, context, {} as vscode.CancellationToken);
        
        assert.ok(actions.length > 0, 'Debería haber devuelto al menos un Code Action.');
        
        const quickFix = actions[0];
        assert.strictEqual(quickFix.title, 'AI Guardian: Aplicar solución automática');
        assert.strictEqual(quickFix.kind, vscode.CodeActionKind.QuickFix);
        assert.strictEqual(quickFix.isPreferred, true);
        assert.ok(quickFix.edit instanceof vscode.WorkspaceEdit, 'Debe asignar un edit reversible.');
    });
});
