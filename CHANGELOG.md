# Change Log

Todos los cambios relevantes de la extensión se documentan aquí.

## [Unreleased]

### Added

- Flujo BYOK completo desde UI:
	- Configurar proveedor y API key.
	- Ver estado BYOK.
	- Limpiar API keys BYOK.
- Almacenamiento seguro de API key con `SecretStorage` de VS Code.
- Migración automática de API key legacy en texto plano a almacenamiento seguro.
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
- Mensajes y logs estandarizados al español.
- README reemplazado por documentación real de producto.
