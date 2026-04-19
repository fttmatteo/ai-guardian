# AI Guardian

AI Guardian es una extensión de VS Code enfocada en seguridad para código generado por IA.
En lugar de acelerar generación de código, prioriza la validación de riesgos para reducir deuda técnica y fallos de seguridad.

## Características principales

- Detección de inserciones grandes de código (flujo típico de herramientas IA).
- Auditoría local con reglas (`rules.json`) para patrones de riesgo frecuentes.
- Auditoría LLM con enfoque BYOK (Bring Your Own Key).
- Soporte multi-proveedor LLM: `gemini`, `openai`, `claude`.
- Integración de cobertura JaCoCo para alertar huecos de testing en Java.
- Modo sombra para reducir fatiga de alertas (solo interrumpe por riesgo alto).

## Instalación y ejecución (desarrollo)

1. Instalar dependencias:

```bash
npm install
```

2. Compilar:

```bash
npm run compile
```

3. Lanzar en modo desarrollo:

- Presiona `F5` en VS Code.

## Configuración BYOK

### Flujo recomendado (UI)

1. Abre la paleta de comandos.
2. Ejecuta `AI Guardian: Configurar BYOK (Proveedor/API Key)`.
3. Selecciona proveedor, perfil (`free`, `balanced`, `deep`) y modelo sugerido.
4. Agrega tu API key.

### Perfiles de uso LLM

- `free`: optimiza costo/cuota; recomendado para uso diario con límites conservadores.
- `balanced`: equilibrio entre costo y profundidad de análisis.
- `deep`: más profundidad de análisis, mayor consumo de cuota.

AI Guardian permite definir guardrails para evitar consumo inesperado de cuota:

- Límite global de llamadas LLM por hora.
- Límite de auditorías LLM por archivo por hora.
- Límite máximo de caracteres por prompt enviado al proveedor.

Cuando se supera un límite, AI Guardian continúa con auditoría local (fallback), sin interrumpir tu flujo.

### Comandos disponibles

- `AI Guardian: Configurar BYOK (Proveedor/API Key)`
- `AI Guardian: Ver estado BYOK`
- `AI Guardian: Ver estado de cuota (panel)`
- `AI Guardian: Limpiar API Keys BYOK`

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

- La API key BYOK se guarda en `SecretStorage` de VS Code (local y seguro).
- Si se detecta una key legacy en texto plano, se migra automáticamente al almacenamiento seguro.
- AI Guardian no expone la API key en logs.

## Reglas locales

Puedes definir reglas personalizadas en la raíz del proyecto:

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

## Pruebas

- Compilación de tests:

```bash
npm run compile-tests
```

- Suite completa:

```bash
npm test
```

- Fallback para CI/local (sin host de VS Code):

```bash
npm run test:ci
```

## Limitaciones actuales

- La precisión depende del proveedor/modelo LLM configurado.
- La detección de inserciones IA se basa en heurísticas de tamaño/velocidad.
- La integración JaCoCo es funcional para casos comunes, pero puede requerir ajustes en estructuras de proyecto no estándar.

## CI para cambios de modelos en proveedores

Si cambian los nombres de modelos en OpenAI, Gemini o Anthropic, puedes mantener la extensión alineada automáticamente:

- Workflow: `.github/workflows/provider-model-watch.yml`
- Frecuencia: diario + ejecución manual (`workflow_dispatch`).
- Acción: consulta catálogos reales de proveedores y sincroniza `src/config/model-catalog.json`.
- Preferencias de reemplazo automático: `src/config/model-replacement-preferences.json`.
- Resultado: crea PR automático cuando detecta cambios.
- Validación en PR: `.github/workflows/provider-model-validate.yml`.
- Resultado en PR: falla si hay modelos del catálogo local que ya no existen en proveedores.

### Secrets requeridos en GitHub

- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `ANTHROPIC_API_KEY`

### Scripts útiles

```bash
npm run models:watch
npm run models:sync
npm run models:validate
```

`models:watch` valida contra proveedores y falla si hay modelos faltantes.

`models:sync` sincroniza el catálogo, poda preferencias obsoletas de forma segura y genera `model-watch-report.json`.

`models:validate` exige API keys de proveedores, falla con modelos faltantes y también falla ante ambigüedades en preferencias.

## Contribuir

Contribuciones son bienvenidas.

- Reporta bugs y sugerencias en issues.
- Propón reglas nuevas en `rules.json`.
- Aporta tests de regresión al modificar heurísticas o auditoría.

## Licencia

MIT
