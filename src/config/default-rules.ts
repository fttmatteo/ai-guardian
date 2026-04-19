import { Rule } from '../types/audit';

export const DEFAULT_RULES: Rule[] = [
    // --- INYECCIÓN (OWASP A03) ---
    {
        id: 'java-sql-injection',
        language: 'java',
        pattern: '\\.execute(?:Update|Query)?\\s*\\(.*\\+.*\\)',
        message: 'Posible Inyección SQL [OWASP A03]. Evite concatenar parámetros en consultas.',
        severity: 'CRITICAL'
    },
    {
        id: 'js-eval-usage',
        language: 'javascript',
        pattern: 'eval\\s*\\(',
        message: 'Uso de eval() detectado [OWASP A03]. Riesgo crítico de ejecución de código.',
        severity: 'CRITICAL'
    },
    {
        id: 'ts-eval-usage',
        language: 'typescript',
        pattern: 'eval\\s*\\(',
        message: 'Uso de eval() detectado [OWASP A03]. Riesgo crítico de ejecución de código.',
        severity: 'CRITICAL'
    },
    {
        id: 'py-eval-exec',
        language: 'python',
        pattern: '(?:eval|exec)\\s*\\(',
        message: 'Uso de eval() o exec() detectado [OWASP A03]. Riesgo crítico de ejecución de código.',
        severity: 'CRITICAL'
    },

    // --- FALLOS CRIPTOGRÁFICOS (OWASP A02) ---
    {
        id: 'hardcoded-api-key',
        language: 'any',
        pattern: '(?:key|secret|token|password|auth|api).*=.*[\'"][a-zA-Z0-9-_]{20,}[\'"]',
        message: 'Posible secreto o API Key hardcodeada [OWASP A02].',
        severity: 'HIGH'
    },
    {
        id: 'weak-crypto-md5',
        language: 'any',
        pattern: 'md5',
        message: 'Uso de MD5 detectado [OWASP A02]. Este algoritmo es criptográficamente débil.',
        severity: 'HIGH'
    },
    {
        id: 'weak-crypto-sha1',
        language: 'any',
        pattern: 'sha1',
        message: 'Uso de SHA1 detectado [OWASP A02]. Este algoritmo es criptográficamente débil.',
        severity: 'HIGH'
    },

    // --- CONTROL DE ACCESO ROTO / PATH TRAVERSAL (OWASP A01) ---
    {
        id: 'path-traversal-general',
        language: 'any',
        pattern: '(?:open|readFile|FileInputStream|File)\\s*\\(.*\\+.*\\)',
        message: 'Posible Path Traversal [OWASP A01]. Verifique que las rutas de archivos no se construyan con datos sin sanear.',
        severity: 'HIGH'
    },

    // --- INTEGRIDAD DE DATOS (OWASP A08) ---
    {
        id: 'py-insecure-pickle',
        language: 'python',
        pattern: 'pickle\\.load\\s*\\(',
        message: 'Deserialización insegura con pickle [OWASP A08]. Puede llevar a RCE.',
        severity: 'CRITICAL'
    },
    {
        id: 'py-insecure-yaml',
        language: 'python',
        pattern: 'yaml\\.load\\s*\\((?!.*SafeLoader)',
        message: 'Uso de yaml.load() sin SafeLoader [OWASP A08]. Riesgo de ejecución de código remoto.',
        severity: 'HIGH'
    },

    // --- SSRF (OWASP A10) ---
    {
        id: 'ssrf-js-axios',
        language: 'javascript',
        pattern: 'axios\\.(?:get|post|put|delete|patch)\\s*\\(.*\\+.*\\)',
        message: 'Posible SSRF [OWASP A10]. Las peticiones de red no deben usar URLs construidas con datos del usuario.',
        severity: 'MEDIUM'
    },
    {
        id: 'ssrf-py-requests',
        language: 'python',
        pattern: 'requests\\.(?:get|post|put|delete|patch)\\s*\\(.*\\+.*\\)',
        message: 'Posible SSRF [OWASP A10]. Las peticiones de red no deben usar URLs construidas con datos del usuario.',
        severity: 'MEDIUM'
    },

    // --- OTROS RIESGOS ---
    {
        id: 'js-inner-html',
        language: 'javascript',
        pattern: '\\.innerHTML\\s*=',
        message: 'Uso de innerHTML detectado. Riesgo de XSS [OWASP A03].',
        severity: 'MEDIUM'
    },
    {
        id: 'java-raw-exec',
        language: 'java',
        pattern: 'Runtime\\.getRuntime\\(\\)\\.exec\\s*\\(',
        message: 'Ejecución de comandos del sistema detectada. Riesgo de inyección de comandos [OWASP A03].',
        severity: 'HIGH'
    }
];
