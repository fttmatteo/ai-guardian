# 🛡️ AI Guardian

*[Read in English](README.en.md)*

<p align="center">
  <img src="docs/logo.png" width="180" alt="Logo AI Guardian">
</p>

<p align="center">
  <strong>El blindaje definitivo para tu código asistido por IA.</strong><br>
  <em>No dejes que la velocidad de la IA comprometa la seguridad de tu producción.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Versión-1.7.1-blue.svg?style=flat-square" alt="Versión">
  <img src="https://img.shields.io/badge/Licencia-MIT-green.svg?style=flat-square" alt="Licencia">
  <img src="https://img.shields.io/badge/Seguridad-OWASP_Top_10-red?style=flat-square" alt="OWASP">
  <img src="https://img.shields.io/badge/Modo-Híbrido_Inteligente-orange?style=flat-square" alt="Híbrido">
</p>

---

## ¿Por qué AI Guardian?

En la era del desarrollo asistido por IA, el código se genera más rápido que nunca, pero también introduce riesgos ocultos. **AI Guardian** es tu última línea de defensa. 

A diferencia de los linters tradicionales, combinamos la **velocidad del análisis local** con la **profundidad semántica de los LLMs** más potentes del mercado, asegurando que cada línea de código sea segura, privada y profesional.

### Características Principales

- **🛡️ Auditoría Industrial (OWASP)**: Blindaje total contra Inyecciones SQL, Path Traversal, SSRF y Criptografía Débil. Alineado con los estándares internacionales del **OWASP Top 10**.
- **⚡ Auto-Corrección Milimétrica (Quick Fixes)**: ¿Encontraste un riesgo? Repáralo al instante. Con `Ctrl + .` (Quick Fix), nuestra IA inyecta el parche de seguridad exacto, respetando tu estilo de código y sin romper el resto del archivo.
- **🤖 Inteligencia Híbrida (BYOK)**: Tú tienes el control. Usa tus propias API Keys (**Gemini, OpenAI, Claude o OpenRouter**) para obtener análisis profundos, mientras nuestras reglas locales trabajan en segundo plano sin costo alguno.
- **🔒 Privacidad de Grado Bancario**: Tus API Keys nunca salen de tu equipo; se guardan en la **bóveda segura de tu Sistema Operativo** (Keychain/Credential Manager). Tus datos solo viajan al proveedor que tú elijas mediante canales cifrados.
- **🚀 Rendimiento Extremo**: Diseñada para no interrumpir. Auditoría asíncrona, gestión inteligente de memoria y zero-lag, incluso en proyectos de gran escala.

---

## Inicio Rápido

### 1. Instalación
Busca **"AI Guardian"** en el Marketplace de VS Code e instálalo en un clic.

### 2. Configuración (Recomendado)
Para desbloquear todo el poder de la detección semántica:
1. `Ctrl + Shift + P` -> `AI Guardian: Configurar BYOK`.
2. Elige tu proveedor favorito e ingresa tu API Key. 
3. *¡Listo! Ya tienes un experto en seguridad auditando tu código en tiempo real.*

### 3. Modos de Uso
- **Modo Proactivo (Automático):** El Guardián vigila tus inserciones de código. Si detecta un bloque nuevo (≥ 5 líneas), activará automáticamente el análisis IA si tienes el BYOK configurado.
- **Auditoría Local (Siempre Activa):** Análisis instantáneo basado en reglas locales que no consume cuota ni requiere internet.
- **Escaneo Profundo Manual:** Ejecuta `AI Guardian: Analizar archivo actual` para un reporte completo y exhaustivo de todo tu documento.

---

## Personalización
Ajusta la experiencia a tu flujo de trabajo en la configuración de VS Code:
- **Shadow Mode**: Mantente enfocado. Solo las alertas de alto riesgo interrumpirán con popups; el resto aparecerá discretamente en tu panel de problemas.
- **Perfiles de Uso**: Selecciona entre `free`, `balanced` o `deep` para optimizar el consumo de tu cuota según la profundidad deseada.

---

## Contribuciones y Seguridad
¿Quieres ayudar a hacer el código del mundo más seguro? 
- Revisa nuestra guía de [Contribuciones](CONTRIBUTING.md).
- Lee nuestra política de [Seguridad](SECURITY.md).

---

<details>
<summary><b>Sección para Desarrolladores</b> (Haz clic para expandir)</summary>

### Compilación y Desarrollo

Si deseas clonar este repo y trabajar en él:
1. `npm install` - Instala dependencias.
2. `npm run watch` - Compilación en tiempo real.
3. `F5` - Lanza una instancia de VS Code con la extensión cargada.

### Estructura del Proyecto

- `src/core/`: Motores de detección, contexto del proyecto y gestión asíncrona de memoria.
- `src/auditors/`: Lógica de análisis local (RegEx cacheadas) y motor LLM (BYOK).
- `src/config/`: Reglas de seguridad predeterminadas y configuraciones.
- `src/providers/`: Integración visual (Diagnósticos y Quick Fix Actions mediante `WeakMap`).

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
- `npm run test:unit` - Compila y ejecuta las pruebas unitarias de la lógica core.
- `npm run test` - Lanza las pruebas de integración en una instancia limpia de VS Code.
</details>

## Créditos y Licencia

Creado y mantenido por **[Mateo Valencia Ardila](https://github.com/fttmatteo)**.

Este software opera bajo la **Licencia MIT**. Eres libre de distribuir, editar o utilizar esta base arquitectónica incluso para desarrollo comercial, bajo la condición obligatoria de preservar explícitamente los párrafos de derechos de autor y el reconocimiento a Mateo Valencia como creador original. (Lee el documento `LICENSE` para más detalles legales).