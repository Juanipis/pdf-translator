# Guía de Recuperación de Flujo de Trabajo

Este documento describe cómo recuperarse de errores comunes en el flujo de trabajo de desarrollo.

## Caso 1: Merge directo a `main` sin pasar por `test` y `release`

Si accidentalmente has realizado un merge directo a la rama `main` sin seguir el flujo correcto (`test` → `release` → `main`), sigue estos pasos:

### Solución 1: Sincronización de ramas (preferida cuando ya se publicó una versión)

```bash
# 1. Sincronizar release con main
git checkout release
git pull origin release
git merge --no-ff main -m "chore: sync release with main"
git push origin release

# 2. Sincronizar test con release
git checkout test
git pull origin test
git merge --no-ff release -m "chore: sync test with release"
git push origin test
```

Esta solución asegura que todas las ramas estén sincronizadas y puedas continuar con el flujo normal para futuros cambios.

### Solución 2: Revertir el merge (solo si aún no se ha publicado una versión)

```bash
# 1. Revertir el merge en main
git checkout main
git revert -m 1 <hash-del-commit-de-merge>
git push origin main

# 2. Seguir el flujo correcto
# Crear PR de los cambios a test, luego a release y finalmente a main
```

Esta solución es más invasiva y solo se recomienda si el merge a `main` fue muy reciente y aún no se ha generado una versión automática.

## Caso 2: Omitir una rama intermedia (ej. de `test` directo a `main`)

```bash
# 1. Sincronizar la rama que se omitió
git checkout release  # La rama omitida
git pull origin release
git merge --no-ff main -m "chore: sync release with main"
git push origin release

# 2. Continuar con el flujo normal
```

## Recordatorio del flujo correcto

1. Crear rama de feature desde `test`
2. Desarrollar usando Conventional Commits
3. PR a `test` (CI verifica y ejecuta tests)
4. PR de `test` a `release` (QA y verificaciones adicionales)
5. PR de `release` a `main` (Genera release automático)

## Cómo prevenir errores en el flujo

- Configurar protecciones de rama en GitHub
- Utilizar la opción "Squash and merge" en lugar de "Create a merge commit"
- Revisar cuidadosamente la rama destino en cada PR
