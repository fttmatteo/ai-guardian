import { Rule } from '../types/audit';

export const DEFAULT_RULES: Rule[] = [
    {
        id: 'java-sql-injection',
        language: 'java',
        pattern: '\\.execute(?:Update|Query)?\\s*\\(.*\\+.*\\)',
        message: 'Posible Inyección SQL detectada (Concatenación en query).',
        severity: 'CRITICAL'
    },
    {
        id: 'js-eval-usage',
        language: 'javascript',
        pattern: 'eval\\s*\\(',
        message: 'Uso de eval() detectado. Representa un alto riesgo de ejecución de código arbitrario.',
        severity: 'CRITICAL'
    },
    {
        id: 'ts-eval-usage',
        language: 'typescript',
        pattern: 'eval\\s*\\(',
        message: 'Uso de eval() detectado. Representa un alto riesgo de ejecución de código arbitrario.',
        severity: 'CRITICAL'
    },
    {
        id: 'hardcoded-api-key',
        language: 'any',
        pattern: '(?:key|secret|token|password|auth|api).*=.*[\'"][a-zA-Z0-9-_]{20,}[\'"]',
        message: 'Posible secreto o API Key hardcodeada detectada.',
        severity: 'HIGH'
    },
    {
        id: 'js-inner-html',
        language: 'javascript',
        pattern: '\\.innerHTML\\s*=',
        message: 'Uso de innerHTML detectado. Puede exponer la aplicación a ataques XSS.',
        severity: 'MEDIUM'
    },
    {
        id: 'java-raw-exec',
        language: 'java',
        pattern: 'Runtime\\.getRuntime\\(\\)\\.exec\\s*\\(',
        message: 'Ejecución de comandos del sistema detectada. Riesgo de inyección de comandos.',
        severity: 'HIGH'
    }
];
