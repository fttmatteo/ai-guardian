import * as assert from 'assert';
import * as vscode from 'vscode';
import { ProjectContextService } from '../../core/project-context.service';

suite('Project Context Service', () => {
    test('Resuelve el contexto de forma asincrónica', async () => {
        const service = new ProjectContextService();
        
        await service.refreshContext();

        const context = service.getContext();
        
        assert.ok(context === 'Unknown' || context === 'Java' || context === 'React' || context === 'Python');
    });

    test('El constructor no bloquea la ejecución principal', () => {
        const startTime = Date.now();
        const serviceLocal = new ProjectContextService();
        const duration = Date.now() - startTime;

        assert.ok(duration < 20, `El constructor tardó ${duration}ms, lo cual indica que pudo haber bloqueado síncronamente.`);
        assert.ok(serviceLocal);
    });
});
