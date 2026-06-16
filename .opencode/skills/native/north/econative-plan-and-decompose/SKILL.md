---
name: econative-plan-and-decompose
description: Transforma una intención en un plan estructurado con fases, tareas y dependencias. Integra el pipeline de workspace/plans/ con persistencia, sync a todowrite y archivado histórico.
---

# Plan and Decompose

## Cuándo usarla

- North recibe una intención del usuario y necesita estructurarla
- Al inicio de sesión para cargar el plan activo desde `workspec/plans/active/plan.md`
- Al cerrar una fase o plan completo para archivarlo
- Cuando se necesita consultar el estado del plan activo → usar `econative_plan_read`

---

## Pipeline completo

### Fase 0: Inicio de sesión — Cargar plan activo

```
1. Ejecutar `econative_plan_read` para cargar el plan activo desde workspec/plans/active/plan.md
2. ¿Hay un plan con fases/tareas?
   ├── Sí → Plasmar en todowrite (reflejo en vivo)
   │        "Acá retomamos: [intención], fase [X], tareas pendientes: [lista]"
   └── No → Esperar intención del usuario (Fase 1)
```

### Fase 1: Descomposición (existente)

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

### Fase 2: Escribir plan persistente

```
1. Escribir plan.md en workspec/plans/active/plan.md
2. Plasmar en todowrite como reflejo en vivo
```

### Fase 3: Durante la sesión — Sync

```
Cada vez que se actualiza todowrite:
├── ¿Cambio significativo? (completar tarea, agregar subtarea)
│   └── Actualizar plan.md para reflejar el estado actual
│
¿Antes de operación de riesgo? (task(), bash crítico)
└── Sync plan.md primero (checkpoint)

¿Se completó una fase?
└── Sync plan.md + actualizar todowrite
```

### Fase 4: Archivado — Plan completado

```
¿El plan está completo? (todas las tareas marcadas)
├── Último sync: todowrite → workspec/plans/active/plan.md
├── Mover: workspec/plans/active/plan.md
│        → workspec/plans/old/plan-YYYY-MM-DD-HHmm.md
├── Limpiar todowrite
├── workspec/plans/active/plan.md queda vacío (o arranca nuevo plan)
└── Preguntar al usuario: "Plan completado. ¿Arrancamos uno nuevo?"
```

---

## Formato de plan.md (persistente)

```markdown
# Plan Activo

## Intención
[lo que estamos construyendo — una línea]

---

## Fases

### Fase 1: [Nombre de fase]
- [x] Tarea completada
- [ ] Tarea pendiente — descripción
- [ ] Tarea pendiente — descripción

### Fase 2: [Nombre de fase]
- [ ] Tarea pendiente — descripción

---

## Dependencias
- [dependencias entre fases o tareas]

---

## Notas
- [decisiones, insights, blockers]
```

---

## Tools del pipeline

| Tool | Propósito |
|---|---|
| `econative_plan_read` | Consultar el plan activo: intención, fases, tareas, progreso |
| `todowrite` | Reflejo en vivo del plan durante la sesión (efímero) |

---

## Reglas

1. **plan.md es la fuente de verdad.** Siempre escribir primero a plan.md antes de todowrite.
2. **todowrite es el espejo en vivo.** Se actualiza a partir de plan.md, no al revés.
3. **Checkpoint ante todo riesgo.** Antes de cualquier operación que pueda fallar (task(), bash crítico), sincronizar a plan.md.
4. **Un plan siempre se completa o se archiva.** No existe "plan abandonado". Si no se completa, queda en active/ para la próxima sesión.
5. **Archivar con timestamp.** Formato `plan-YYYY-MM-DD-HHmm.md` para tener trazabilidad.
6. **El plan lo decide North. Esta skill solo estructura.**
