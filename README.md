# 🛡️ AI Guardian

*[Read in English](README.en.md)*

<p align="center">
  <img src="docs/logo.png" width="200" alt="Logo AI Guardian">
</p>

<p align="center">
  <strong>El guardián de seguridad potenciado por IA para tu código.</strong><br>
  <em>Auditoría de seguridad inteligente y preventiva para el flujo de trabajo moderno.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Versión-1.2.0-blue.svg" alt="Versión">
  <img src="https://img.shields.io/badge/Licencia-MIT-green.svg" alt="Licencia">
  <img src="https://img.shields.io/badge/VS%20Code-v1.85.0+-blue" alt="Versión VS Code">
  <img src="https://img.shields.io/badge/Seguridad-OWASP-red" alt="Enfocado en Seguridad">
</p>


## ¿Qué es AI Guardian?

**AI Guardian** es una extensión de VS Code diseñada para auditar la seguridad de tu código, especialmente aquel generado o asistido por Inteligencia Artificial. Combina análisis estático local ultrarrápido con la potencia semántica de modelos LLM avanzados bajo un modelo **BYOK (Bring Your Own Key)**.

## Características Principales

- **Auditoría Híbrida**: Combina reglas locales (basadas en patrones) con análisis semántico vía LLM.
- **BYOK Multi-Proveedor**: Soporte nativo para **Gemini, OpenAI y Claude**.
- **Detección de Inserciones**: Heurística avanzada para detectar bloques grandes de código pegados de IAs.
- **Guardrails Operativos**: Control estricto de cuota y costos para proteger tu bolsillo.
- **Modo Sombra**: Notificaciones inteligentes que solo te interrumpen en riesgos críticos.
- **Métricas de Consumo**: Panel visual de uso y estado de cuota en tiempo real.
- **Integración JaCoCo**: Detección de brechas de cobertura en proyectos Java.

## Inicio Rápido

### 1. Instalación
Busca "AI Guardian" en el Marketplace de VS Code o instala las dependencias localmente para desarrollo:
```bash
npm install
npm run compile
```

### 2. Configuración BYOK
1. Abre la paleta de comandos (`Ctrl+Shift+P`).
2. Ejecuta: `AI Guardian: Configurar BYOK (Proveedor/API Key)`.
3. Selecciona tu proveedor (Gemini, OpenAI o Claude).
4. Elige un perfil (**free, balanced o deep**).
5. Ingresa tu API Key (se guarda de forma segura en `SecretStorage`).

## Configuración

Puedes personalizar el comportamiento de AI Guardian en la sección de Settings:

| Configuración | Descripción | Por Defecto |
| :--- | :--- | :--- |
| `ai-guardian.llm.provider` | Proveedor LLM elegido. | `gemini` |
| `ai-guardian.llm.profile` | Perfil de profundidad (free, balanced, deep). | `free` |
| `ai-guardian.llm.maxCallsPerHour` | Límite de llamadas para proteger costos. | `30` |
| `ai-guardian.notifications.shadowMode` | Solo interrumpir en riesgos altos. | `true` |

## Reglas Locales

AI Guardian usa un archivo `rules.json` en la raíz de tu proyecto para auditorías instantáneas sin costo de API:

```json
[
  {
    "id": "raw-sql-check",
    "language": "java",
    "pattern": "\\.execute(?:Update|Query)?\\s*\\(",
    "message": "Posible Inyección SQL detectada.",
    "severity": "HIGH"
  }
]
```

## Contribuciones

¿Quieres mejorar AI Guardian? ¡Eres bienvenido! Por favor revisa nuestra guía de [CONTRIBUTING.md](CONTRIBUTING.md).

## Seguridad

La seguridad es mi prioridad. Si encuentras una vulnerabilidad, por favor consulta nuestra política en [SECURITY.md](SECURITY.md).

## Créditos y Licencia

Creado y mantenido por **[Mateo Valencia Ardila](https://github.com/fttmatteo)**.

Este software operada bajo la **Licencia MIT**. Eres libre de distribuir, editar o utilizar esta base arquitectónica incluso para desarrollo comercial bajo la principal condición obligatoria de preservar explícitamente los párrafos de derechos de autor y reconocimiento a Mateo Valencia como creador matriz. (Lee el documento `LICENSE` para más instrucciones legales).
