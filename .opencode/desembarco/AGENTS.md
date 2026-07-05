# Crisol-Eco — Ecosystem

> Ecosistema de desarrollo autónomo para OpenCode.
> **North** planifica, **Executor** implementa, **Auditor** revisa.
> Publicable, clonable, mantenible.

<!-- CRISOL-ECO — ARCHIVO DEL ECOSISTEMA. NO MODIFICAR AUTOMÁTICAMENTE. -->
<!-- Si necesitás agregar skills, dominios o MCPs, completá el manifiesto de abajo
     o creá tu propio archivo y referencialo acá. El agente lo lee al inicio. -->

## ⚙️ Manifiesto del proyecto

North actualiza esta sección automáticamente. Consultala para saber qué skills, dominios y MCPs están disponibles.

### Stack

| Tecnología | Propósito |
|---|---|
| OpenCode | Runtime de agentes |
| TypeScript | Plugins (tools) |
| Markdown | Skills, dominios, contexto |
| GitHub | Skill library remota |

### Skills externas

Skills de terceros o custom del proyecto. Viven en `.opencode/skills/extern/<nombre-de-la-skill>/Skill.md`.

Por convención, creá una carpeta con el nombre de la skill y dentro un `Skill.md` con la documentación.
Después de agregar una skill o plugin, **reiniciá el runtime de OpenCode** para que se cargue.

Ejemplo:
```
.opencode/skills/extern/
└── mi-skill-personalizada/
    └── Skill.md
```

North las registra acá automáticamente al instalarlas con `econative-skill-installer`.

- _(sin skills externas instaladas)_

### Dominios del proyecto

Dominios curados en `workspec/domains/` además del `_template.md` de referencia.
Se consultan bajo demanda con `econative_domain_list` / `econative_domain_reader`.

North los registra acá automáticamente al curarlos con `econative-curacion-dominios`.

- _(sin dominios curados aún)_

### MCPs del proyecto

MCPs configurados en `opencode.json` además del `seq-thinking` nativo del ecosistema.
Si agregás un MCP global, listalo igual para que el agente sepa que está disponible.

- `seq-thinking` (ecosistema) — razonamiento estructurado multi-paso solo para tareas complejas
- _(sin MCPs adicionales configurados)_

### Links

- **Skill library**: [PortalesCode/skill-library](https://github.com/PortalesCode/skill-library)
- **Contexto del proyecto**: `workspec/context/`

---

## Agentes disponibles

| Agente | Modo | Rol |
|---|---|---|
| `North` | primary | Orquestador. No toca código. Planifica, delega, decide. |
| `Executor` | subagent | Ejecutor técnico. Implementa, refactoriza, debuggea. |
| `Auditor` | subagent | Revisor. Analiza, detecta riesgos, no modifica código. |

### Filosofía

```
North = dirección
Executor = operación
Auditor = control
Skills = cómo trabajar
Domains = qué saber (pasivo, consultable bajo demanda, no se inyecta en el prompt)
Context = estado del proyecto
Memoria = buffer entre efímero y permanente
```

## Skills disponibles

### Nativas (`skills/native/`)

Son **patrones operativos** del ecosistema — definen *cómo trabajan los agentes*, no importa el rubro del proyecto.

Aunque los nombres suenen a código (implement-safe, debug-systematic, test-and-validate), describen dinámicas universales:
planificar, descomponer, ejecutar, revisar, validar, diagnosticar. Si el proyecto no es de software, North abstrae
que la operativa es la misma — solo cambia qué se implementa, debuggea o valida.

| Skill | Usada por | Propósito |
|---|---|---|
| `native/north/econative-architecture-review` | North | Revisar arquitectura y detectar riesgos |
| `native/north/econative-parallel-dispatch` | North | Detectar independencia y lanzar ejecutores paralelos |
| `native/north/econative-curacion-dominios` | North | Curar dominios: detectar gap, investigar, escribir, verificar |
| `native/executor/econative-implement-safe` | Executor | Implementación segura (workspace, reglas, rollback) |
| `native/executor/econative-debug-systematic` | Executor | Debugging metódico (6 pasos + antipatrones) |
| `native/executor/econative-test-and-validate` | Executor | Testing y validación con comandos por lenguaje |
| `native/auditor/econative-audit-review` | Auditor | Revisión estructurada (6 dimensiones + informe) |

### Externas (`skills/extern/`)

Aquí van las skills de **terceros** y las **creadas o customizadas por el usuario** para el proyecto específico.
Separadas de las nativas porque estas son conocimiento del dominio del proyecto, no patrones operativos del ecosistema.
Se agregan según necesidad del proyecto — no vienen incluidas por defecto.

## Plugins disponibles (tools)

| Tool | Qué hace |
|---|---|
| `econative_start_session` | **Obligatorio** al inicio. Desembarca contextos y AGENTS.md si es primera vez. Carga contexto, memorias, stack, preferences. |
| `econative_context_read` | Lee todos los .md de `workspec/context/` (PROJECT, CONVENTIONS, ARCHITECTURE, STATUS, SKILL-REGISTRY, etc). Sin límite de tamaño. |
| `econative_plan` | **Tool única** para gestionar el plan. Acciones: `design`, `start`, `close`, `status`, `archive` |
| `econative_plan_sync` | Helper: sincroniza todowrite ↔ plan.md: `to-todo` carga el plan, `to-plan` persiste cambios |
| `econative_plan_archive` | Helper: archiva plan completado a `workspec/plans/old/` con timestamp y crea nuevo plan.md vacío |
| `econative_status` | Vista unificada del proyecto: contexto + plan + stack + descubrimientos en un solo reporte |
| `econative_save_preferences` | Guarda nombre e idioma del usuario en workspec/Memoria/preferences-user/ |
| `econative_stack_snapshot` | Escanea stack, escribe current.json y archiva snapshots viejos |
| `econative_remember_it` | Guarda descubrimiento en workspec/Memoria/discoveries/ con título, descripción, contenido, tags, importancia y estado |
| `econative_remember_list` | Lista descubrimientos — solo metadata (título, descripción, tags, importancia, fecha, estado). Sin contenido |
| `econative_remember_show` | Lee el contenido COMPLETO de un descubrimiento por nombre de archivo |
| `econative_domain_list` | Escanea workspec/domains/ y devuelve lista de dominios con título y descripción |
| `econative_domain_reader` | Lee contenido completo de un dominio |
| `econative_domain_write` | Crea o actualiza dominio |

### Comandos

| Comando | Qué hace |
|---|---|
| `scan-stack` | Toma snapshot del stack del proyecto |
| `remember-it` | Guarda un recuerdo en la memoria compartida |
| `remember-list` | Lista descubrimientos (solo metadata) |

### Hooks

| Plugin | Qué hace |
|---|---|
| `econative-inject-summary.ts` | Inyecta resumen compacto de tools, skills y reglas del Auditor en el system prompt de cada request. No es una tool — es un hook permanente. |

## Dominios disponibles

Los dominios son **conocimiento pasivo, informativo y consultable** sobre un tema. No son operativos — no le dicen a un agente *cómo* hacer algo (eso es una skill), sino *qué es* algo o *cómo funciona*.

Viven en `workspec/domains/`. Se consultan bajo demanda con `econative_domain_list` y `econative_domain_reader`. No se inyectan en el prompt.

### Formato

Solo 2 reglas fijas:
1. `$$Título del Dominio$$` en la primera línea
2. `&&Descripción breve&&` en la segunda línea

Después de eso, markdown libre. No hay estructura rígida — el contenido se adapta al tema.

Hay un `_template.md` en `workspec/domains/` con ejemplos de qué va como dominio y qué no.

### Responsabilidad

| Quién | Qué hace |
|---|---|
| **North** | Cura dominios activamente cuando detecta gaps recurrentes, usando la skill `econative-curacion-dominios`. |
| **Usuario** | Puede pedir dominios específicos o corregir los curados por North. |

Si North detecta un **gap recurrente de conocimiento**, lo cura automáticamente usando la skill `econative-curacion-dominios`.
Si detecta un **patrón operativo repetitivo**, sugiere crear una skill en vez de un dominio.

## Contexto del proyecto

> Los archivos de contexto viven en `workspec/context/` en la **raíz del proyecto** (no dentro de `.opencode/`). Se acceden con `econative_context_read` en cualquier momento, o via `econative_start_session` al inicio de sesión.

| Archivo | Propósito | Lo escribe |
|---|---|---|
| `workspec/context/PROJECT.md` | Qué es el proyecto, stack, objetivos | North |
| `workspec/context/CONVENTIONS.md` | Reglas del repo | North |
| `workspec/context/ARCHITECTURE.md` | Arquitectura actual | North |
| `workspec/context/STATUS.md` | Estado actual, pendientes, issues | North |

## Memoria del proyecto

> La memoria operativa del ecosistema vive dentro de `workspec/Memoria/` — en la raíz del proyecto, fuera del ecosistema.

| Ruta | Propósito | Lo escribe |
|---|---|---|
| `workspec/Memoria/preferences-user/config.json` | Preferencias del usuario (nombre, idioma) | North via tool |
| `workspec/Memoria/stack/current.json` | Snapshot actual del stack | North via tool / comando |
| `workspec/Memoria/stack/snapshots-old/` | Snapshots anteriores del stack | Tool automático |
| `workspec/Memoria/discoveries/` | Descubrimientos y recuerdos compartidos (fecha, tags, importancia) | North via tool / comando |

## Flujo de inicio de sesión

1. **North** llama **`econative_start_session`**
2. Si `onboarding_required` → pregunta nombre e idioma → `econative_save_preferences`
3. North revisa contexto, stack, memorias y recuerdos
4. North espera la intención del usuario

## Flujo de trabajo

1. **North** recibe intención del usuario
2. **North** consulta skills, dominios y contexto
3. **North** usa `sequential_thinking` si el problema es complejo
4. **North** ejecuta **`econative_plan({action: "design", intention, phases, tasks})`** para estructurar el plan
5. **North** decide paralelismo entre tareas y asigna **Executor(s)** con `task()`
6. **Por cada tarea:** `econative_plan start` → `task(Executor)` → `econative_plan close`
7. **North** decide si invocar al **Auditor** según las reglas de la tabla abajo
8. **North** decide qué persistir (discoveries, stack)
9. **North** ejecuta **`econative_plan({action: "archive"})`** al completar el plan

## ⚖️ ¿Cuándo llamar al Auditor?

North decide según estas reglas:

| Situación | ¿Auditor? |
|---|---|
| Cambio trivial (typo, rename, 1 archivo, < 10 líneas) | ❌ No — directo |
| Feature nuevo o cambio en +3 archivos | ⚠️ A criterio de North |
| Cambia lógica crítica (auth, datos sensibles, core del negocio) | ✅ Sí, siempre |
| Múltiples Executors tocaron los mismos archivos | ✅ Sí — detectar conflictos |
| Código legacy sin tests | ⚠️ A criterio (North decide según impacto) |
| Usuario dice explícitamente "no hace falta revisión" | ❌ No |
| Antes de mergear a main o tag | ✅ Sí |
| Refactor grande (> 5 archivos o > 200 líneas tocadas) | ✅ Sí |
| El usuario pidió expresamente una revisión | ✅ Sí |
| North no está segura del resultado del Executor | ✅ Sí — mejor prevenir |

**Regla práctica:** Ante la duda, llamalo. Es más barato detectar un problema en revisión que arreglarlo en producción.

## Tools nativas de OpenCode

| Tool | Para qué | Config |
|---|---|---|
| `question()` | Preguntar al usuario con opciones o texto libre | `opencode.json` > `permission.question: allow` |
| `sequential_thinking` | Razonamiento estructurado multi-paso, solo para tareas complejas. Usar **siempre el del ecosistema** (definido en `opencode.json` local), no el global. | `opencode.json` > `mcp.seq-thinking` |

## Engram — memoria persistente (heredado de la config global)

Engram está disponible para TODOS los agentes del ecosistema (North, Executor, Auditor). Heredado del `~/.config/opencode/AGENTS.md` global.

| Herramienta | Para qué |
|---|---|
| `mem_save(title, type, content, topic_key?)` | Guardar decisión, bugfix, descubrimiento entre sesiones |
| `mem_search(query)` | Buscar en memoria persistente por texto |
| `mem_get_observation(id)` | Ver contenido completo de un recuerdo |
| `mem_context()` | Ver sesiones recientes |
| `mem_session_summary(content)` | Cerrar sesión con resumen estructurado |
| `mem_suggest_topic_key(title, type)` | Obtener key estable para upserts |
| `mem_doctor()` | Diagnóstico del estado de Engram |

### Combinación Engram + tools econativas

Engram y las tools econativas (`econative_remember_*`) son complementarias, no redundantes:

| Situación | Engram (`mem_save`) | Econativa (`remember_it`) |
|---|---|---|
| **¿Quién lo gatilla?** | Automático (session_summary) y North cuando decide | North cuando decide |
| **¿Dónde vive?** | SQLite en `~/.config/opencode/` (invisible) | Markdown en `workspec/Memoria/discoveries/` (visible en el repo) |
| **¿Quién lo ve?** | Solo los agentes | Cualquier developer que abra el repo |
| **¿Para qué sirve?** | Memoria operativa entre sesiones | Trazabilidad del proyecto |
| **¿Persiste entre sesiones?** | ✅ Sí | ✅ Sí |
| **¿Se trackea en git?** | ❌ No (fuera del repo) | ✅ Sí (dentro del proyecto) |

**Regla práctica:**
- Si es **conocimiento del proyecto** que un developer nuevo debería encontrar → `econative_remember_it`
- Si es **contexto de sesión** que solo el agente necesita recordar mañana → `mem_save` (automático en session_summary)
- Si estás en duda → `econative_remember_it`. El markdown se puede borrar si sobra. Engram es más difícil de limpiar.

## Notas

- Los agentes se cargan automáticamente desde `agents/`
- Las skills en `skills/native/` se registran automáticamente
- Los plugins en `plugins/` se compilan y exponen como tools
- Los dominios se consultan bajo demanda, no se inyectan en el prompt
- Las skills de terceros van en `skills/extern/`
- La memoria pesada queda fuera del ecosistema local
