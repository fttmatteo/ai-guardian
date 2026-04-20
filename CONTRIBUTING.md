# Guía de Contribución para AI Guardian

_[Read in English](CONTRIBUTING.en.md)_

¡Gracias por mostrar interés en desarrollar y mejorar **AI Guardian**! Como un proyecto de código abierto, dependemos de mentes brillantes y analíticas para robustecer la arquitectura que nos protege a todos.

## Entorno de Desarrollo

### Prerrequisitos

- [Node.js](https://nodejs.org/) (v18 o superior)
- [VS Code](https://code.visualstudio.com/)
- [Git](https://git-scm.com/)

### Pasos

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/fttmatteo/ai-guardian.git
   ```
2. **Instalar dependencias**:
   ```bash
   npm install
   ```
3. **Compilar la extensión**:
   ```bash
   npm run compile
   ```
4. **Abrir en VS Code**:
   ```bash
   code .
   ```
5. **Lanzamiento**:
   Presiona `F5` para abrir una nueva ventana de VS Code con la extensión cargada.

## Pruebas

AI Guardian enfatiza la confiabilidad. Por favor, asegúrate de que tus cambios pasen todas las pruebas antes de enviar un PR.

- **Ejecutar todas las pruebas**:
  ```bash
  npm test
  ```
- **Ejecutar solo pruebas unitarias**:
  ```bash
  npm run test:unit
  ```

## Estándares de Código y Rendimiento

- Usa **TypeScript** para toda la lógica de la extensión.
- Respeta el formateo existente (ESLint está configurado).
- Escribe mensajes de commit descriptivos siguiendo [Conventional Commits](https://www.conventionalcommits.org/).
- **Rendimiento:** Evita por completo la API sincrónica del subsistema de archivos (`fs.readFileSync`). Siempre usa asincronía (`fs.promises`) para no congelar la UI de VS Code. Las Expresiones Regulares deben pre-compilarse y cacheados.
- Asegúrate de que las nuevas funciones tengan pruebas.

## Proceso de Pull Request

1. **Crear una rama**: `feat/tu-funcion` o `fix/tu-correccion`.
2. **Commit de cambios**: Asegúrate de que las pruebas pasen localmente.
3. **Crear el PR**: Describe los cambios, el "Por qué" y cualquier cambio disruptivo (breaking change).
4. **Revisión**: Espera el feedback del mantenedor.

## Fork

Para iniciar, haz un Fork, abre tu rama (`git checkout -b feature/MiInventoAsombroso`), inyecta tu código y sube tu historia (`git commit -m 'Hice esta locura'`). ¡Quedamos sumamente atentos!

## Checklist

- [ ] Mi código sigue las guías de estilo de este proyecto.
- [ ] He realizado una auto-revisión de mi propio código.
- [ ] He comentado mi código, especialmente en áreas difíciles de entender.
- [ ] He realizado los cambios correspondientes en la documentación.
- [ ] Mis cambios no generan nuevas advertencias (warnings).
- [ ] He añadido pruebas que demuestran que mi corrección es efectiva o que mi función funciona.

## Licencia

Al contribuir, aceptas que tus contribuciones estarán bajo la **Licencia MIT** del proyecto.
