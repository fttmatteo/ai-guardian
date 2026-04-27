# 🛡️ AI Guardian

*[Read in English](README.en.md)*

<p align="center">
  <img src="docs/logo.png" width="200" alt="Logo AI Guardian">
</p>

<p align="center">
  <strong>Seguridad inteligente y preventiva para tu código asistido por IA.</strong><br>
  <em>Protege tu flujo de trabajo detectando riesgos de OWASP en tiempo real.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Versión-1.6.0-blue.svg" alt="Versión">
  <img src="https://img.shields.io/badge/Licencia-MIT-green.svg" alt="Licencia">
  <img src="https://img.shields.io/badge/Seguridad-OWASP-red" alt="Enfocado en Seguridad">
  <img src="https://img.shields.io/badge/Modo-Proactivo-orange" alt="Auditoría Proactiva">
</p>

## ¿Qué es AI Guardian?

AI Guardian es una extensión de VS Code diseñada para auditar la seguridad de tu código, especialmente aquel generado o asistido por Inteligencia Artificial. Combina análisis estático local ultrarrápido con la potencia semántica de modelos LLM avanzados bajo un modelo BYOK (Bring Your Own Key).

### Características

- **Auditoría Industrial (OWASP)**: Detecta Inyecciones SQL, Path Traversal, SSRF y Criptografía Débil alineado con los estándares del OWASP Top 10.
- **Auto-Corrección (Quick Fixes)**: ¡No solo detectamos, también reparamos! Haz clic en el bombillo amarillo (`Ctrl + .`) sobre una vulnerabilidad y la IA inyectará de forma milimétrica el código seguro para solucionarlo al instante sin dañar el resto del archivo. *(💡 **Tip Pro:** Si tu documento tiene múltiples vulnerabilidades, soluciona una usando Quick Fix y presiona `Ctrl + S` para guardar. Esto obligará al Guardián a auto-recalcular inmediatamente las coordenadas perfectas del texto para tus siguientes correcciones).*
- **Proactividad Total**: El Guardián escanea automáticamente al abrir archivos, al guardar o al detectar una inserción de código. No tienes que configurar nada.
- **Ultra-Ligera y Optimizada**: Desarrollada con estándares de ingeniería de alto rendimiento. Las lecturas son asincrónicas y la gestión de memoria interna garantiza que VS Code jamás se congele, incluso en archivos monstruosos o en proyectos gigantes.
- **Soporte Multilingüe**: Protección nativa para **Java, Python, JavaScript, TypeScript y React**.
- **Auditoría Híbrida Inteligente**: Combina la velocidad de reglas locales con la profundidad semántica de LLMs bajo el modelo **BYOK (Bring Your Own Key)**.
- **Privacidad Garantizada**: Tus API Keys se guardan de forma segura en tu bóveda interna del Sistema Operativo (Credential Manager/Keychain) sin exponerse. Tus datos solo viajan al proveedor que tú elijas mediante encriptación punto a punto (Gemini, OpenAI o Claude).

## Inicio Rápido en 3 Pasos

### 1. Instalación

Busca **"AI Guardian"** en el Marketplace de VS Code e instálalo.

### 2. Configuración (Opcional pero Recomendado)

Para activar la potencia de la IA y auditorías semánticas:
1. Abre la paleta de comandos (`Ctrl+Shift+P`).
2. Ejecuta: `AI Guardian: Configurar BYOK (Proveedor/API Key)`.
3. Ingresa tu API Key de Gemini, OpenAI o Claude.

### 3. ¡A trabajar!

- **Modo Automático:** Al abrir o guardar archivos, el Guardián usa sus veloces motores de **reglas locales (Offline)** para detectar fugas de inmediato sin gastar tu API Key. Solo acude automáticamente al motor de Inteligencia Artificial (LLM) si detecta que has *pegado o inyectado* un bloque de código considerable (≥ 5 líneas). 
- **Modo Profundo (IA):** Si deseas obligar a la Inteligencia Artificial a escanear tu archivo desde arriba hasta abajo sin importar su tamaño para obtener curaciones matemáticas y semánticas, ejecuta el comando: `AI Guardian: Analizar archivo actual`.

## Personalización

Puedes ajustar tu nivel de seguridad en los **Settings** de VS Code:
- **Modo Sombra**: Si está activo, solo las alertas críticas interrumpirán con popups, el resto se quedan silenciosas en la lista de problemas.
- **Perfiles de IA**: Selecciona entre `free`, `balanced` o `deep` para equilibrar el costo y la calidad del análisis.

## Contribuciones y Seguridad

¿Quieres mejorar el Guardián o encontraste algo? 
- Revisa nuestra guía de [Contribuciones](CONTRIBUTING.md).
- Lee nuestra política de [Seguridad](SECURITY.md).

---

<details>
<summary>🛠️ <b>Sección para Desarrolladores</b> (Haz clic para expandir)</summary>

### Compilación y Desarrollo

Si deseas clonar este repo y trabajar en él:
1. `npm install` - Instala dependencias.
2. `npm run watch` - Compilación en tiempo real.
3. `F5` - Lanza una instancia de VS Code con la extensión cargada.

### Estructura del Proyecto

- `src/core/`: Motores de detección, servicios asíncronos y sistema anti-fugas.
- `src/auditors/`: Lógica de análisis local (RegEx cacheadas) y motor LLM.
- `src/config/`: Reglas de seguridad y configuraciones.
- `src/providers/`: Motores de integración Visual (Diagnósticos y Quick Fix Actions mediante `WeakMap`).

### Arquitectura de Rendimiento (Devs)

AI Guardian está diseñado para no bloquear el Hilo Principal del *Extension Host*:
- Utiliza **lecturas asincrónicas delegadas (fs.promises)** para la determinación del contexto de Workspace.
- Aplica **WeakMaps** para vincular soluciones a diagnósticos visuales, forzando la liberación temporal de memoria (Garbage Collection) al cerrar archivos y previendo fugas de memoria OOM.
- Las expresiones regulares se **pre-compilan una sola vez**; el conteo de bloques inyectados emplea evaluación atómica `match()` para no recrear buffers masivos.

### Añadir Reglas Locales Personalizadas

Si deseas que el Guardián detecte vulnerabilidades específicas del equipo de seguridad empresarial, crea un archivo `rules.json` directamente en la raíz de tu proyecto (Workspace).

El formato del archivo debe ser un Arreglo de Reglas (`Array<Rule>`), por ejemplo:
```json
[
  {
    "id": "no-hardcoded-passwords",
    "language": "any", 
    "pattern": "(password|clave|secret)\\s*=\\s*['\\\"][a-zA-Z0-9]+['\\\"]",
    "message": "Detectado un posible Hardcoding de credenciales en el código fuente.",
    "severity": "HIGH"
  }
]
```
**Parámetros obligatorios:**
- `id`: Nombre único que identifica a tu regla personalizada.
- `language`: Lenguaje a inspeccionar (ej: `java`, `python`, `javascriptreact`, o `any` para auditar todos).
- `pattern`: La expresión regular (Regex) que captura el texto del error.
- `message`: La alerta que verá el desarrollador cuando se rompa la regla.
- `severity`: Gravedad del error: `CRITICAL`, `HIGH`, `MEDIUM` o `LOW`.

### Ejecución de Pruebas

Para asegurar la estabilidad del Guardián:
- `npm run test:unit` - Ejecuta las pruebas unitarias de la lógica core.
- `npm run test` - Lanza las pruebas de integración en una instancia de VS Code.
</details>

## Créditos y Licencia

Creado y mantenido por **[Mateo Valencia Ardila](https://github.com/fttmatteo)**.

Este software operada bajo la **Licencia MIT**. Eres libre de distribuir, editar o utilizar esta base arquitectónica incluso para desarrollo comercial bajo la principal condición obligatoria de preservar explícitamente los párrafos de derechos de autor y reconocimiento a Mateo Valencia como creador matriz. (Lee el documento `LICENSE` para más instrucciones legales).