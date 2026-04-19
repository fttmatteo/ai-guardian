# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.3.4](https://github.com/fttmatteo/ai-guardian/compare/v1.3.3...v1.3.4) (2026-04-19)


### Bug Fixes

* **docs:** improve security table regex to handle markdown spacing ([7704e8b](https://github.com/fttmatteo/ai-guardian/commit/7704e8b8456a00e0789df13c90063f4d1e204c0d))

### [1.3.3](https://github.com/fttmatteo/ai-guardian/compare/v1.3.2...v1.3.3) (2026-04-19)

### [1.3.2](https://github.com/fttmatteo/ai-guardian/compare/v1.3.0...v1.3.2) (2026-04-19)


### Features

* add custom standard-version updater for Markdown file tracking ([b66ea3a](https://github.com/fttmatteo/ai-guardian/commit/b66ea3af118806a84ed5c8e5574b9bc217b00ad2))

## [1.3.0](https://github.com/fttmatteo/ai-guardian/compare/v1.2.0...v1.3.0) (2026-04-19)


### Maintenance

* bump version to 1.2.0 and add posttag hook to standard-version configuration ([0646e62](https://github.com/fttmatteo/ai-guardian/commit/0646e627830c54354540cfd18800b2f346e8078d))
* configure standard-version to automatically push tags to origin main ([4b3c734](https://github.com/fttmatteo/ai-guardian/commit/4b3c734073a070c47c0e4d31aee70da0390799c4))

## [1.2.0](https://github.com/fttmatteo/ai-guardian/compare/v1.1.0...v1.2.0) (2026-04-19)


### Features

* add automated version synchronization script for documentation files ([a00f694](https://github.com/fttmatteo/ai-guardian/commit/a00f694b6340e7d017444e2296ed9688e1938665))
* add version synchronization script and update documentation badges and security tables ([3cb1a8a](https://github.com/fttmatteo/ai-guardian/commit/3cb1a8a3e259ea51e831af999d046b99c17f38e1))
* add version synchronization script and update documentation to v1.1.x ([253532f](https://github.com/fttmatteo/ai-guardian/commit/253532f2c5357704fa823775c614e99eac822dc0))

## 1.1.0 (2026-04-19)

### Features

* Actualizar CHANGELOG y README para reflejar cambios en la gestión de API keys y contribuciones ([6f73a74](https://github.com/fttmatteo/ai-guardian/commit/6f73a743fcfe6d998d883a459cc43683d7f94626))
* Actualizar documentación y reglas de auditoría para mejorar la detección de riesgos ([809cd96](https://github.com/fttmatteo/ai-guardian/commit/809cd96951d74450b169850a688b76b97eff197c))
* Implement AI code insertion detection and LLM usage management ([a16bcf0](https://github.com/fttmatteo/ai-guardian/commit/a16bcf0c7132aa6ddb1b96682a7497056193fd85))
* integrate standard-version for automated release management and changelog generation ([74f4b38](https://github.com/fttmatteo/ai-guardian/commit/74f4b38628782c111d7758ad9f7d5fcfc97fc5b2))
* Simplificar la gestión de API keys LLM y mejorar mensajes de advertencia ([1f137fc](https://github.com/fttmatteo/ai-guardian/commit/1f137fc2400fcdda888f2b4b1ca82b8255a6a29d))


### Documentation

* add project documentation, branding assets, and automated versioning script ([3eeca8d](https://github.com/fttmatteo/ai-guardian/commit/3eeca8d745f6400757f35ab556120bf3dc2aabee))

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
- **Documentación Profesional Bilingüe**:
	- Rediseño completo de README en Español e Inglés.
	- Nuevas guías de contribución (`CONTRIBUTING.md`) y políticas de seguridad (`SECURITY.md`).
	- Repositorio de activos visuales en carpeta `docs/`.
- **Automatización de Versionamiento**:
	- Script de sincronización automática para propagar la versión de `package.json` a toda la documentación.
	- Integración con hooks de ciclo de vida de NPM.

### Changed

- Auditoría LLM y configuración generalizadas a un enfoque agnóstico de proveedor.
- Reglas locales centralizadas en `rules.json` como fuente única.
- Catálogo de modelos centralizado en `src/config/model-catalog.json`.
- Preferencias de reemplazo de modelos centralizadas en `src/config/model-replacement-preferences.json`.
- Eliminado soporte legacy de API keys en settings; BYOK usa `SecretStorage` como única fuente.
- Mensajes y logs estandarizados al español.
- Metadatos de la extensión (`displayName`, `description`) localizados al español para el Marketplace.
- README reemplazado por documentación real de producto.
