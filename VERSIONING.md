# Estrategia de Versionamiento - AI Guardian

Este documento detalla el flujo de trabajo y las herramientas utilizadas para el control de versiones, la generación de registros de cambios (Changelog) y la sincronización de la documentación en el proyecto **AI Guardian**.

## Estándar de Mensajes: Conventional Commits

AI Guardian sigue la especificación de [Conventional Commits](https://www.conventionalcommits.org/), lo que permite la automatización completa del versionamiento. Los mensajes de commit deben seguir la estructura:

`<tipo>[opcional scope]: <descripción>`

- **feat**: Nueva funcionalidad (corresponde a una versión **MINOR**).
- **fix**: Corrección de un error (corresponde a una versión **PATCH**).
- **docs**: Cambios en la documentación.
- **style**: Cambios que no afectan el significado del código (espacios, formato, etc).
- **refactor**: Cambio en el código que no corrige un error ni añade una funcionalidad.
- **perf**: Cambio en el código que mejora el rendimiento.
- **test**: Añadir o corregir pruebas.
- **build**: Cambios que afectan al sistema de construcción o dependencias externas.
- **ci**: Cambios en los archivos y scripts de configuración de CI.
- **chore**: Otros cambios que no modifican los archivos `src` o `test`.
- **BREAKING CHANGE**: Un commit que tiene el texto `BREAKING CHANGE:` al inicio de su cuerpo o una `!` después del tipo/scope (corresponde a una versión **MAJOR**).

---

## Herramienta: Standard Version

Utilizamos `standard-version` para gestionar el incremento de versiones y la actualización del archivo `CHANGELOG.md`.

### Comandos de Lanzamiento

Para subir de versión, utiliza los siguientes comandos según el tipo de cambio realizado:

| Comando | Tipo de Versión | Ejemplo |
| :--- | :--- | :--- |
| `npm run release:patch` | **Patch** (Parche) | `1.5.0` ➡️ `1.5.1` |
| `npm run release:minor` | **Minor** (Menor) | `1.5.0` ➡️ `1.6.0` |
| `npm run release:major` | **Major** (Mayor) | `1.5.0` ➡️ `2.0.0` |

---

## Flujo de Automatización

Cuando ejecutas un comando de `release`, ocurren los siguientes pasos automáticamente:

1.  **Incremento de Versión**: Se actualiza la propiedad `version` en `package.json` y `package-lock.json`.
2.  **Generación de Changelog**: Se analizan todos los commits realizados desde la última etiqueta (tag) y se añaden al archivo `CHANGELOG.md`.
3.  **Sincronización de Documentación (`postbump`)**:
    - Se ejecuta el script `scripts/sync-version.cjs`.
    - Se actualizan los **badges** de versión en `README.md`, `README.en.md`, `SECURITY.md` y `SECURITY.en.md`.
    - Se actualiza la tabla de soporte de seguridad en los archivos correspondientes para reflejar la nueva versión de mantenimiento (ej: `1.6.x`).
4.  **Commit de Release**: Se crea un commit automático con los cambios en los archivos de versión y el changelog.
5.  **Etiquetado (Tagging)**: Se crea una etiqueta Git (tag) con el nuevo número de versión (ej: `v1.6.0`).
6.  **Publicación de Tags (`posttag`)**:
    - Se ejecuta un `git push --follow-tags origin main`, subiendo automáticamente el commit de release y la nueva etiqueta al repositorio remoto.

---

## Archivos Involucrados

La configuración de este proceso se encuentra en el archivo [`.versionrc`](.versionrc) en la raíz del proyecto. Los archivos que se actualizan automáticamente son:

- `package.json`
- `package-lock.json`
- `CHANGELOG.md`
- `README.md`
- `README.en.md`
- `SECURITY.md`
- `SECURITY.en.md`

## Notas Importantes

- **Rama Principal**: El proceso de release está configurado para empujar cambios directamente a la rama `main`. Asegúrate de estar en `main` y tener los últimos cambios antes de ejecutar un release.
- **Permisos**: Debes tener permisos de escritura en el repositorio remoto para que el comando final de `push` sea exitoso.
- **Drafts**: `standard-version` no crea un "Release" en la interfaz de GitHub, solo la etiqueta. La creación del Release formal en GitHub con los binarios de la extensión se gestiona usualmente de forma manual o mediante GitHub Actions adicionales.