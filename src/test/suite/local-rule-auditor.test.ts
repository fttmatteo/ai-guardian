import * as assert from 'assert';
import { LocalRuleAuditor } from '../../auditors/local-rule-auditor';

suite('Local Rule Auditor', () => {
    let auditor: LocalRuleAuditor;

    setup(() => {
        auditor = new LocalRuleAuditor();
    });

    test('las reglas pre-compiladas se inicializan una vez', () => {
        const rules = (auditor as any).compiledRules;
        assert.ok(rules.length > 0, 'Debería haber reglas compiladas cargadas por defecto.');
        
        assert.ok(rules[0].regex instanceof RegExp);
    });

    test('encuentra coincidencias exactas y calcula las lineas correctamente', async () => {
        const code = `
const foo = "bar";
const noauth = true;

// Hardcoding de credenciales a continuacion
const password = "mySuperSecretPassword";
        `.trim();

        const findings = await auditor.audit(code, 'javascript');
        
        assert.ok(findings.length > 0, 'No detectó el hardcoding de la palabra clave password.');
        
        const passwordFinding = findings.find(f => f.reason.toLowerCase().includes('hardcoding') || (f.line !== undefined && f.line > 0));
        assert.ok(passwordFinding !== undefined);
        assert.ok(passwordFinding!.line! > 2); // Deberia mapearlo despues de las primeras lineas
    });
    
    test('ejecuta rapidamente sin fugas OOM ni arrays masivos en archivos gigantes', async () => {
        const goodLine = 'const variable = "seguro";\n';
        const vulnerableLine = 'const password = "mySuperSecretPassword";\n';
        
        const giantCode = goodLine.repeat(5000) + vulnerableLine + goodLine.repeat(5000);
        
        const startTime = Date.now();
        const findings = await auditor.audit(giantCode, 'javascript');
        const duration = Date.now() - startTime;
        
        assert.ok(duration < 200, `El parser demoró mas de lo esperado: ${duration}ms, asumiendo array splits ineficientes.`);
        assert.strictEqual(findings.length, 1, 'Debería encontrar una sola vulnerabilidad en un pajar de 10.000 lineas.');
        assert.strictEqual(findings[0].line, 5000, 'El calculo de la linea vulnerada matematico fallo.');
    });
});
