# AI Guardian

AI Guardian es una extensión de VS Code orientada a auditoría de seguridad para código generado o asistido por IA.
Su objetivo es reducir riesgo técnico y de seguridad durante la edición, manteniendo un flujo de trabajo práctico para equipos de desarrollo.

## Estado actual del proyecto

Este repositorio está en estado funcional y listo para uso en desarrollo:

- Auditoría híbrida local + LLM operativa.
- Flujo BYOK multi proveedor operativo.
- Guardrails de costo/cuota activos.
- Integración básica con cobertura JaCoCo para Java.
- Automatización CI para cambios de nombres de modelos en proveedores externos.

## Alcance funcional para usuario final

### Capacidades principales

- Detección de inserciones grandes de código (heurística para bloques típicos de generación IA).
- Reglas locales de seguridad por patrón (archivo `rules.json`).
- Auditoría semántica por LLM con BYOK.
- Diagnósticos en editor y notificaciones por severidad.
- Modo sombra para reducir interrupciones por hallazgos de riesgo bajo/medio.
- Panel visual de estado de cuota y consumo.

### Lenguajes soportados en auditoría activa

- `java`
- `javascript`
- `typescript`
- `javascriptreact`
- `typescriptreact`

### Contexto de proyecto detectado

- Spring Boot
- Java
- React
- Unknown (fallback)

## BYOK y configuración operativa

### Proveedores soportados

- `gemini`
- `openai`
- `claude`

### Comandos disponibles

- `AI Guardian: Configurar BYOK (Proveedor/API Key)`
- `AI Guardian: Ver estado BYOK`
- `AI Guardian: Ver estado de cuota (panel)`
- `AI Guardian: Limpiar API Keys BYOK`

### Flujo recomendado de configuración

1. Abrir paleta de comandos.
2. Ejecutar `AI Guardian: Configurar BYOK (Proveedor/API Key)`.
3. Elegir proveedor, perfil y modelo sugerido.
4. Guardar API key.

### Perfiles de uso LLM

- `free`: menor costo/cuota.
- `balanced`: equilibrio costo-calidad.
- `deep`: mayor profundidad de análisis.

### Guardrails de consumo

- Límite global de llamadas LLM por hora.
- Límite de auditorías LLM por archivo por hora.
- Límite de tamaño de prompt por auditoría.

Si un límite se excede, AI Guardian mantiene fallback local para no cortar el flujo de trabajo.

### Settings relevantes

- `ai-guardian.llm.provider`
- `ai-guardian.llm.profile`
- `ai-guardian.llm.model`
- `ai-guardian.llm.baseUrl`
- `ai-guardian.llm.timeoutMs`
- `ai-guardian.llm.maxRetries`
- `ai-guardian.llm.maxCallsPerHour`
- `ai-guardian.llm.maxAuditsPerFilePerHour`
- `ai-guardian.llm.maxPromptChars`
- `ai-guardian.metrics.enableLocalTelemetry`
- `ai-guardian.notifications.shadowMode`

## Privacidad y seguridad

- API keys BYOK almacenadas en `SecretStorage` de VS Code.
- No se exponen API keys en logs de la extensión.

## Integración JaCoCo (Java)

AI Guardian intenta leer reporte de cobertura en:

- `target/site/jacoco/jacoco.xml`

La integración es best-effort y prioriza alertar métodos sin cobertura en escenarios comunes de proyecto Java.

## Reglas locales

`rules.json` en la raíz del proyecto es la fuente única y centralizada de reglas locales de auditoría.

Ejemplo:

```json
[
  {
    "id": "java-raw-sql",
    "language": "java",
    "pattern": "\\.execute(?:Update|Query)?\\s*\\(\\s*['\\\"]\\s*(SELECT|INSERT|UPDATE|DELETE)",
    "message": "SQL crudo detectado.",
    "severity": "HIGH"
  }
]
```

## Instalación y ejecución en desarrollo

1. Instalar dependencias.

```bash
npm install
```

2. Compilar extensión.

```bash
npm run compile
```

3. Ejecutar en modo extensión de desarrollo (VS Code): `F5`.

## Pruebas

- Compilar tests:

```bash
npm run compile-tests
```

- Suite de extensión (host de VS Code):

```bash
npm test
```

- Fallback CI/local (sin host de VS Code):

```bash
npm run test:ci
```

## CI de gobernanza de modelos (proveedores externos)

Para cambios de nombres/availability de modelos en proveedores:

- Workflow de sincronización automática: `.github/workflows/provider-model-watch.yml`
- Workflow de validación en PR: `.github/workflows/provider-model-validate.yml`

Archivos de configuración involucrados:

- Catálogo operativo: `src/config/model-catalog.json`
- Preferencias de reemplazo: `src/config/model-replacement-preferences.json`

Comportamiento actual del pipeline:

- Sincroniza catálogo con APIs de proveedores.
- Poda preferencias obsoletas de manera segura.
- Falla validación cuando hay modelos faltantes o ambigüedad en preferencias.

### Secrets requeridos en GitHub

- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `ANTHROPIC_API_KEY`

### Scripts de operación

```bash
npm run models:watch
npm run models:sync
npm run models:validate
```

## Limitaciones conocidas

- La calidad de hallazgos LLM depende del proveedor, modelo y prompt.
- La detección de inserciones IA es heurística, no forense.
- La integración JaCoCo puede requerir ajustes en estructuras de build no estándar.
- El alcance actual de lenguajes está acotado al conjunto declarado en la extensión.

## Estructura del repositorio

- `src/`: código fuente de la extensión.
- `scripts/`: utilidades operativas y automatización de modelos.
- `.github/workflows/`: CI/CD y validaciones automáticas.
- `.vscode/`: tareas y launch de desarrollo compartibles.

## Contribuciones

Las contribuciones son bienvenidas. Antes de abrir un Pull Request, revisa:

- `CONTRIBUTING.md` para flujo de trabajo, estándares y checklist de calidad.
- `SECURITY.md` para reporte responsable de vulnerabilidades.

## Créditos y Licencia

Creado y mantenido por **[Mateo Valencia Ardila](https://github.com/fttmatteo)**.

Este software operada bajo la **Licencia MIT**. Eres libre de distribuir, editar o utilizar esta base arquitectónica incluso para desarrollo comercial bajo la principal condición obligatoria de preservar explícitamente los párrafos de derechos de autor y reconocimiento a Mateo Valencia como creador matriz. (Lee el documento `LICENSE` para más instrucciones legales).
