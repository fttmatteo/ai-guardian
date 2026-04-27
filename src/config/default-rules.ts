import { Rule } from '../types/audit';

export const DEFAULT_RULES: Rule[] = [
    // --- INYECCIÓN (OWASP A03) ---
    {
        id: 'java-sql-injection',
        language: 'java',
        pattern: '(?:query|sql|stmt).*=.*\\+.*|\\.execute(?:Update|Query)?\\s*\\(.*\\+.*\\)',
        message: 'Posible Inyección SQL. Evite construir consultas concatenando datos del usuario, use Prepared Statements en su lugar.',
        severity: 'CRITICAL',
        category: 'OWASP-A03',
        cwe: 'CWE-89'
    },
    {
        id: 'js-eval-usage',
        language: 'javascript',
        pattern: 'eval\\s*\\(',
        message: 'Uso de eval() detectado. Riesgo crítico de ejecución de código. Considere usar alternativas más seguras como JSON.parse().',
        severity: 'CRITICAL',
        category: 'OWASP-A03',
        cwe: 'CWE-95'
    },
    {
        id: 'ts-eval-usage',
        language: 'typescript',
        pattern: 'eval\\s*\\(',
        message: 'Uso de eval() detectado. Riesgo crítico de ejecución de código arbitrario.',
        severity: 'CRITICAL',
        category: 'OWASP-A03',
        cwe: 'CWE-95'
    },
    {
        id: 'py-eval-exec',
        language: 'python',
        pattern: '(?:eval|exec)\\s*\\(',
        message: 'Uso de eval() o exec() detectado. Permite la ejecución de código Python inyectado por el atacante.',
        severity: 'CRITICAL',
        category: 'OWASP-A03',
        cwe: 'CWE-95'
    },
    {
        id: 'node-child-process-exec',
        language: 'javascript',
        pattern: 'child_process\\.exec\\s*\\(',
        message: 'Ejecución de comandos con exec(). Utilice spawn() o execFile() en su lugar para evitar inyección de comandos.',
        severity: 'HIGH',
        category: 'OWASP-A03',
        cwe: 'CWE-78'
    },
    {
        id: 'python-shell-true',
        language: 'python',
        pattern: 'shell\\s*=\\s*True',
        message: 'Ejecución de comando con shell=True detectada. Riesgo crítico de Inyección de Comandos. Utilice shell=False y pase los argumentos como una lista.',
        severity: 'CRITICAL',
        category: 'OWASP-A03',
        cwe: 'CWE-78'
    },
    {
        id: 'java-raw-exec',
        language: 'java',
        pattern: 'Runtime\\.getRuntime\\(\\)\\.exec\\s*\\(',
        message: 'Ejecución de comandos del sistema detectada. Riesgo de inyección de comandos OS. Use ProcessBuilder en su lugar.',
        severity: 'HIGH',
        category: 'OWASP-A03',
        cwe: 'CWE-78'
    },

    // --- FALLOS CRIPTOGRÁFICOS (OWASP A02) ---
    {
        id: 'weak-crypto-md5',
        language: 'any',
        pattern: 'md5',
        message: 'Uso de MD5 detectado. Este algoritmo es criptográficamente débil y propenso a colisiones. Use SHA-256 o superior.',
        severity: 'HIGH',
        category: 'OWASP-A02',
        cwe: 'CWE-328'
    },
    {
        id: 'weak-crypto-sha1',
        language: 'any',
        pattern: 'sha1',
        message: 'Uso de SHA1 detectado. Algoritmo obsoleto e inseguro para firmas y hashes. Migre a la familia SHA-2 o SHA-3.',
        severity: 'HIGH',
        category: 'OWASP-A02',
        cwe: 'CWE-328'
    },
    {
        id: 'insecure-http-url',
        language: 'any',
        pattern: 'http://(?!localhost|127\\.0\\.0\\.1)',
        message: 'Uso de URL con HTTP no local. La comunicación sin cifrar permite ataques Man-in-the-Middle. Use HTTPS.',
        severity: 'MEDIUM',
        category: 'OWASP-A02',
        cwe: 'CWE-319'
    },

    // --- SECRETOS Y CREDENCIALES (OWASP A02 / A07) ---
    {
        id: 'hardcoded-aws-key',
        language: 'any',
        pattern: 'AKIA[0-9A-Z]{16}',
        message: 'Secreto detectado: Posible AWS Access Key ID. Mueva este secreto a un gestor de secretos o variables de entorno.',
        severity: 'CRITICAL',
        category: 'Secrets',
        cwe: 'CWE-798'
    },
    {
        id: 'hardcoded-github-token',
        language: 'any',
        pattern: 'ghp_[a-zA-Z0-9]{36}',
        message: 'Secreto detectado: Posible GitHub Personal Access Token.',
        severity: 'CRITICAL',
        category: 'Secrets',
        cwe: 'CWE-798'
    },
    {
        id: 'hardcoded-slack-webhook',
        language: 'any',
        pattern: 'https://hooks\\.slack\\.com/services/T[a-zA-Z0-9_]+/B[a-zA-Z0-9_]+/[a-zA-Z0-9_]+',
        message: 'Secreto detectado: Slack Webhook URL.',
        severity: 'CRITICAL',
        category: 'Secrets',
        cwe: 'CWE-798'
    },
    {
        id: 'hardcoded-generic-api-key',
        language: 'any',
        pattern: '(?:key|secret|token|password|auth|api).*=.*[\'"][a-zA-Z0-9-_]{20,}[\'"]',
        message: 'Posible secreto o API Key hardcodeada de forma genérica. Evite embeber credenciales en el código fuente.',
        severity: 'HIGH',
        category: 'Secrets',
        cwe: 'CWE-798'
    },

    // --- CONTROL DE ACCESO ROTO / PATH TRAVERSAL (OWASP A01) ---
    {
        id: 'path-traversal-general',
        language: 'any',
        pattern: '(?:open|readFile|FileInputStream|File)\\s*\\(.*\\+.*\\)',
        message: 'Posible Path Traversal. Construir rutas de archivos con datos no saneados puede exponer el sistema de archivos del servidor.',
        severity: 'HIGH',
        category: 'OWASP-A01',
        cwe: 'CWE-22'
    },
    {
        id: 'cors-wildcard',
        language: 'any',
        pattern: 'Access-Control-Allow-Origin\\s*:\\s*\\*',
        message: 'CORS permisivo detectado (*). Esto permite a cualquier sitio web acceder a la API. Configure dominios específicos permitidos.',
        severity: 'MEDIUM',
        category: 'OWASP-A01',
        cwe: 'CWE-942'
    },

    // --- INTEGRIDAD DE DATOS Y DESERIALIZACIÓN (OWASP A08) ---
    {
        id: 'py-insecure-pickle',
        language: 'python',
        pattern: 'pickle\\.load\\s*\\(',
        message: 'Deserialización insegura con pickle. Deserializar datos no confiables permite Ejecución de Código Remoto (RCE).',
        severity: 'CRITICAL',
        category: 'OWASP-A08',
        cwe: 'CWE-502'
    },
    {
        id: 'py-insecure-yaml',
        language: 'python',
        pattern: 'yaml\\.load\\s*\\((?!.*SafeLoader)',
        message: 'Uso de yaml.load() sin SafeLoader. Riesgo de ejecución de código remoto al parsear YAML malicioso.',
        severity: 'HIGH',
        category: 'OWASP-A08',
        cwe: 'CWE-502'
    },

    // --- SSRF (OWASP A10) ---
    {
        id: 'ssrf-js-axios',
        language: 'javascript',
        pattern: 'axios\\.(?:get|post|put|delete|patch)\\s*\\(.*\\+.*\\)',
        message: 'Posible Server-Side Request Forgery (SSRF). Las peticiones de red deben validar/sanear las URLs antes de invocarlas.',
        severity: 'MEDIUM',
        category: 'OWASP-A10',
        cwe: 'CWE-918'
    },
    {
        id: 'ssrf-py-requests',
        language: 'python',
        pattern: 'requests\\.(?:get|post|put|delete|patch)\\s*\\(.*\\+.*\\)',
        message: 'Posible SSRF en librería requests. Evite interpolar datos de usuario directamente en el parámetro URL.',
        severity: 'MEDIUM',
        category: 'OWASP-A10',
        cwe: 'CWE-918'
    },

    // --- FRONTEND Y XSS (OWASP A03) ---
    {
        id: 'react-dangerously-set-inner-html',
        language: 'typescriptreact',
        pattern: 'dangerouslySetInnerHTML',
        message: 'Uso de dangerouslySetInnerHTML detectado. Inyectar HTML sin escapar (ej. con DOMPurify) lleva directamente a XSS.',
        severity: 'HIGH',
        category: 'OWASP-A03',
        cwe: 'CWE-79'
    },
    {
        id: 'js-inner-html',
        language: 'javascript',
        pattern: '\\.innerHTML\\s*=',
        message: 'Asignación a innerHTML detectada. Riesgo de XSS DOM-based. Utilice textContent en su lugar.',
        severity: 'MEDIUM',
        category: 'OWASP-A03',
        cwe: 'CWE-79'
    },
    {
        id: 'js-protocol-in-url',
        language: 'any',
        pattern: 'href\\s*=\\s*["\']javascript:',
        message: 'Uso del pseudo-protocolo javascript: en un enlace. Esto es un vector clásico de Cross-Site Scripting (XSS).',
        severity: 'HIGH',
        category: 'OWASP-A03',
        cwe: 'CWE-79'
    },
    {
        id: 'node-insecure-cookie',
        language: 'javascript',
        pattern: 'cookie\\s*:\\s*{[^}]*(?!(.*httpOnly\\s*:\\s*true))',
        message: 'Configuración de cookie sin flag httpOnly. Los scripts del cliente (y posibles XSS) pueden acceder a la sesión.',
        severity: 'MEDIUM',
        category: 'OWASP-A05',
        cwe: 'CWE-1004'
    },

    // --- PRIVACIDAD Y WEB STORAGE ---
    {
        id: 'web-storage-sensitive-data',
        language: 'any',
        pattern: '(?:localStorage|sessionStorage)\\.setItem\\s*\\(\\s*[\'"](?:token|session|password|auth|secret)[\'"]',
        message: 'Almacenando datos sensibles en Web Storage. Estos pueden ser robados mediante XSS. Use Cookies HttpOnly y Secure.',
        severity: 'HIGH',
        category: 'Privacy',
        cwe: 'CWE-312'
    },

    // --- INFRAESTRUCTURA COMO CÓDIGO (IaC) ---
    {
        id: 'docker-user-root',
        language: 'dockerfile',
        pattern: '^\\s*USER\\s+root\\b',
        message: 'Uso de USER root en Dockerfile. Correr contenedores como root incrementa drásticamente el impacto de un escape del contenedor.',
        severity: 'HIGH',
        category: 'Infra',
        cwe: 'CWE-269'
    }
];
