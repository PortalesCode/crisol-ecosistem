---
name: econative-plan-and-decompose
description: Usá esta skill cuando necesites transformar una intención en un plan estructurado con fases, tareas y dependencias. North la usa como metodología de planificación.
---

# Plan and Decompose

## Cuándo usarla

North recibe una intención del usuario y necesita descomponerla en tareas ejecutables.

## Pipeline

```
Intención (una frase)
↓
Alcance — ¿qué entra y qué no?
↓
Fases — agrupaciones lógicas de trabajo
↓
Tareas — unidades mínimas ejecutables
↓
Dependencias — qué necesita qué
↓
Orden — secuencia vs paralelo
```

## Formato del plan

```markdown
## Plan: [nombre descriptivo]

### Intención
[lo que el usuario pidió, en sus palabras]

### Alcance
- Incluye: [lista]
- Excluye: [lista]

### Fases
1. **Fase 1: [nombre]**
   - Tareas: [lista de tareas]
   - Depende de: [nada | fase anterior | tarea específica]

2. **Fase 2: [nombre]**
   - ...

### Tareas detalladas
| ID | Tarea | Fase | Depende de | Tipo | ¿Paralelizable? |
|---|---|---|---|---|---|
| T1 | ... | 1 | — | implementar | sí |
| T2 | ... | 1 | T1 | refactor | no |
| T3 | ... | 2 | T1 | validar | sí |

### Asignación
- T1, T3 → Executor A
- T2 → Executor B
- Auditor → Fase 2 completa
```

## Reglas

- Una tarea = una unidad ejecutable por un Executor.
- Si una tarea requiere más de 15 min, dividila.
- Las dependencias son estrictas: North no asigna hasta que la dependencia esté resuelta.
- El plan lo decide North. Esta skill solo estructura.
