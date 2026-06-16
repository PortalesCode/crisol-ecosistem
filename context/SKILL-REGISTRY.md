# SKILL-REGISTRY

## Remote URL
<!-- URL base del repositorio remoto de skills -->
https://raw.githubusercontent.com/tu-usuario/skill-library/main

## Cómo funciona
1. North detecta que necesita una skill para la tarea actual
2. Consulta este archivo para saber dónde está el catálogo remoto
3. Busca en el index remoto si la skill existe
4. Descarga solo los archivos de esa skill
5. Los instala en .opencode/skills/extern/<nombre>/
6. OpenCode descubre la skill y queda disponible

## Skills instaladas localmente
Las skills instaladas bajo demanda están en .opencode/skills/extern/
No es necesario listarlas acá — North las detecta automáticamente.

## Notas
- No clonar el repo completo. Solo descargar lo necesario.
- Si una skill ya está instalada, no descargarla de nuevo.
- Este archivo lo lee North con econative-skill-installer.
