# Change Log

Todos los cambios relevantes de la extensión se documentan aquí.

## [1.0.0]

### Added

- Flujo BYOK completo desde UI:
	- Configurar proveedor y API key.
	- Ver estado BYOK.
	- Limpiar API keys BYOK.
- Almacenamiento seguro de API key con `SecretStorage` de VS Code.
- Soporte multi-proveedor LLM: `gemini`, `openai`, `claude`.
- Configuración de robustez LLM:
	- `ai-guardian.llm.timeoutMs`
	- `ai-guardian.llm.maxRetries`
- Reintentos con backoff y manejo de errores clasificados (auth, rate limit, server, network, timeout).
- Modo sombra para reducir interrupciones por hallazgos de riesgo medio/bajo.
- Filtro de archivos auditables para evitar ruido en logs/output/plaintext.
- Suite inicial de pruebas con smoke test y tests de detector de cambios.

### Changed

- Auditoría LLM y configuración generalizadas a un enfoque agnóstico de proveedor.
- Reglas locales centralizadas en `rules.json` como fuente única.
- Catálogo de modelos centralizado en `src/config/model-catalog.json`.
- Preferencias de reemplazo de modelos centralizadas en `src/config/model-replacement-preferences.json`.
- Eliminado soporte legacy de API keys en settings; BYOK usa `SecretStorage` como única fuente.
- Mensajes y logs estandarizados al español.
- README reemplazado por documentación real de producto.
