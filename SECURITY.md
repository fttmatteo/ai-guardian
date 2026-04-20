# Política de Seguridad

*[Read in English](SECURITY.en.md)*

## Versiones Soportadas

Proporcionare actualizaciones de seguridad para las siguientes versiones:

| Versión | ¿Soportada Activamente? |
| ------- | ------------------ |
| v1.4.x | :white_check_mark: |
| Antiguas | :x:                |

## Mejores Prácticas BYOK

Dado que AI Guardian opera bajo un modelo **Bring Your Own Key** (Trae tu propia llave), los usuarios son responsables de sus API Keys.

1. **Almacenamiento Seguro**: AI Guardian utiliza el `SecretStorage` de VS Code para cifrar y guardar tus llaves. Nunca compartas tus configuraciones de `.vscode` con las llaves expuestas.
2. **Rotación de Llaves**: Recomendamos rotar tus API keys periódicamente.
3. **Límites de Uso**: Configura siempre alertas de presupuesto en el panel de tu proveedor (Google AI Studio, OpenAI, Anthropic).
4. **Revisión de Parches ("Quick Fixes")**: AI Guardian emite correcciones de código asistidas por IA. Dado que los LLMs pueden "alucinar", debes revisar **siempre** el código propuesto antes de hacer el commit final. El uso de las auto-correcciones es responsabilidad del desarrollador.

## Detectar una Vulnerabilidad

Si descubres una vulnerabilidad de seguridad, por favor **NO** abras un issue público. Sigue estos pasos:

1. Envía un correo electrónico privado o mensaje directo al empaquetador del proyecto (**Mateo Valencia Ardila**) con el asunto `AI GUARDIAN VULNERABILITY`.
2. Provee un PoC (Proof of Concept) o un código de inyección reproducible.
3. Trataremos de mitigar la brecha publicando un "Hotfix" de seguridad dentro del ciclo semanal posterior a la lectura formal del informe. Agradecemos inmensamente a quien detecte errores letales con ánimos de ayudar.

## Divulgación

Seguimos prácticas de divulgación responsable. No divulgaremos la vulnerabilidad hasta que haya un parche disponible y los usuarios hayan tenido tiempo de actualizar, a menos que sea en el mejor interés de la comunidad.
