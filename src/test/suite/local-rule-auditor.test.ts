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

    test('propaga correctamente las propiedades category y cwe al emitir el hallazgo', async () => {
        const code = `
            const token = "AKIA1234567890123456";
        `;
        const findings = await auditor.audit(code, 'javascript');
        assert.ok(findings.length > 0, 'Debería encontrar la llave AWS falsa.');
        const awsFinding = findings.find(f => f.reason.includes('AWS'));
        assert.ok(awsFinding !== undefined, 'Debería haber un hallazgo de AWS.');
        assert.strictEqual(awsFinding.category, 'Secrets', 'La categoría no se propagó.');
        assert.strictEqual(awsFinding.cwe, 'CWE-798', 'El CWE no se propagó.');
    });

    test('soporta el lenguaje dockerfile y detecta el usuario root', async () => {
        const dockerCode = `
FROM node:18
USER root
RUN npm install
        `;
        const findings = await auditor.audit(dockerCode, 'dockerfile');
        assert.ok(findings.length > 0, 'No detectó el USER root en el dockerfile.');
        const rootFinding = findings.find(f => f.category === 'Infra' && f.cwe === 'CWE-269');
        assert.ok(rootFinding !== undefined, 'No encontró la regla específica de Docker.');
    });
});
