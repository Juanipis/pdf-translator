# Guía de Contribución

¡Gracias por tu interés en contribuir a PDF Translator! Este documento proporciona lineamientos y mejores prácticas para contribuir a este proyecto.

## Flujo de trabajo de Git

Usamos un flujo de trabajo basado en ramas con las siguientes características:

1. **Rama `main`**: Contiene la versión estable del proyecto. Las releases oficiales se generan desde esta rama.

2. **Rama `release`**: Contiene la próxima versión lista para ser liberada. Funciona como una vista previa de lo que se desplegará en `main`.

3. **Rama `test`**: Es donde se integran todos los cambios de los desarrolladores. Esta rama no genera releases.

4. **Ramas de características (`feature/*`) o correcciones (`fix/*`)**: Aquí es donde los desarrolladores trabajan en nuevas funcionalidades o correcciones.

## Pasos para contribuir

1. **Fork y clona el repositorio**

   ```
   git clone https://github.com/YOUR_USERNAME/pdf-translator.git
   cd pdf-translator
   git remote add upstream https://github.com/Juanipis/pdf-translator.git
   ```

2. **Crea una rama para tu contribución**

   ```
   git checkout test
   git pull upstream test
   git checkout -b feature/mi-nueva-funcionalidad
   ```

3. **Realiza tus cambios siguiendo la guía de estilo del proyecto**

4. **Haz commit de tus cambios usando Conventional Commits**

   ```
   git add .
   git commit -m "feat: agregar traducción automática"
   ```

5. **Actualiza tu rama con los últimos cambios de `test`**

   ```
   git checkout test
   git pull upstream test
   git checkout feature/mi-nueva-funcionalidad
   git rebase test
   ```

6. **Envía tus cambios y crea un Pull Request**
   ```
   git push -u origin feature/mi-nueva-funcionalidad
   ```
   Después ve a GitHub y crea un pull request desde tu rama `feature/mi-nueva-funcionalidad` a la rama `test` del repositorio original.

## Conventional Commits

Todos los commits deben seguir la especificación de [Conventional Commits](https://www.conventionalcommits.org/). Esto nos permite generar automáticamente el CHANGELOG y determinar el tipo de cambio semántico (MAJOR.MINOR.PATCH).

Formato básico:

```
<tipo>[ámbito opcional]: <descripción>

[cuerpo opcional]

[nota(s) al pie opcional(es)]
```

Tipos principales:

- **feat**: Añade una nueva característica
- **fix**: Corrige un bug
- **docs**: Cambios en la documentación
- **style**: Cambios que no afectan al significado del código (espacios, puntuación, etc.)
- **refactor**: Cambio de código que no corrige ni añade nada
- **perf**: Cambio que mejora el rendimiento
- **test**: Añade o modifica pruebas
- **build**: Cambios que afectan al sistema de build o dependencias externas
- **ci**: Cambios en configuración CI
- **chore**: Otros cambios que no modifican src o archivos de prueba

Ejemplos:

```
feat(translator): añadir soporte para idioma francés
fix(pdf-viewer): corregir error al cargar documentos grandes
docs: actualizar README con nuevas instrucciones de instalación
```

## Proceso de Revisión de Código

Todos los pull requests serán revisados por al menos un miembro del equipo. Puedes esperar:

1. Comentarios sobre el diseño de tu solución
2. Sugerencias de mejoras o alternativas
3. Peticiones de pruebas adicionales o documentación

## Versionado

Este proyecto usa el versionado semántico (SemVer):

- **MAJOR**: Cambios incompatibles con versiones anteriores
- **MINOR**: Adiciones de funcionalidades compatibles con versiones anteriores
- **PATCH**: Correcciones de errores compatibles con versiones anteriores

El versionado se maneja automáticamente basado en los mensajes de commit cuando se fusiona con las ramas `main` o `release`.
