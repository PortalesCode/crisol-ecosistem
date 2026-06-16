# Crisol-Eco — Ecosystem

<!-- CRISOL-ECO — ARCHIVO DEL ECOSISTEMA. NO MODIFICAR AUTOMÁTICAMENTE. -->
<!-- Si necesitás agregar skills, dominios o MCPs, completá el manifiesto de abajo
     o creá tu propio archivo y referencialo acá. El agente lo lee al inicio. -->

## ⚙️ Manifiesto del proyecto

Completá esta sección con lo que tu proyecto necesite. El agente lo consulta al inicio para saber qué tenés disponible.

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

Listá las skills que hayas agregado:

- _(completar)_

### Dominios del proyecto

Dominios curados en `.opencode/domains/` además del `_template.md` de referencia.
Se consultan bajo demanda con `econative_domain_list` / `econative_domain_reader`.

- _(completar)_

### MCPs del proyecto

MCPs configurados en `opencode.json` además del `seq-thinking` nativo del ecosistema.
Si agregás un MCP global, listalo igual para que el agente sepa que está disponible.

- _(completar)_

---

## Agentes disponibles

| Agente | Modo | Rol |
|---|---|---|
| `North` | primary | Orquestador. No toca código. Planifica, delega, decide. |
| `Executor` | subagent | Ejecutor técnico. Implementa, refactoriza, debuggea. |
| `Auditor` | subagent | Revisor. Analiza, detecta riesgos, no modifica código. |

## Skills disponibles

### Nativas (`skills/native/`)

Son **patrones operativos** del ecosistema — definen *cómo trabajan los agentes*, no importa el rubro del proyecto.

Aunque los nombres suenen a código (implement-safe, debug-systematic, test-and-validate), describen dinámicas universales:
planificar, descomponer, ejecutar, revisar, validar, diagnosticar. Si el proyecto no es de software, North abstrae
que la operativa es la misma — solo cambia qué se implementa, debuggea o valida.

| Skill | Usada por | Propósito |
|---|---|---|
| `native/north/econative-plan-and-decompose` | North | Planificar intención → fases → tareas |
| `native/north/econative-architecture-review` | North | Revisar arquitectura y detectar riesgos |
| `native/north/econative-parallel-dispatch` | North | Detectar independencia y lanzar ejecutores paralelos |
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
| `econative_start_session` | **Obligatorio** al inicio. Carga contexto (desde `context/` en raíz), memorias, stack, preferences |
| `econative_context_read` | Lee los 4 archivos de contexto (PROJECT, CONVENTIONS, ARCHITECTURE, STATUS) desde `context/` en la raíz. Sin límite de tamaño. Útil para consultar contexto sin depender de start_session |
| `econative_save_preferences` | Guarda nombre e idioma del usuario en Memoria/preferences-user/ |
| `econative_stack_snapshot` | Escanea stack, escribe current.json y archiva snapshots viejos |
| `econative_remember_it` | Guarda descubrimiento en Memoria/discoveries/ con título, descripción, contenido, tags, importancia y estado |
| `econative_remember_list` | Lista descubrimientos — solo metadata (título, descripción, tags, importancia, fecha, estado). Sin contenido |
| `econative_remember_show` | Lee el contenido COMPLETO de un descubrimiento por nombre de archivo |
| `econative_task_init` | Registra tarea en el log del sistema |
| `econative_task_closeout` | Marca tarea como completada en el log |
| `econative_domain_list` | Escanea .opencode/domains/ y devuelve lista de dominios con título y descripción |
| `econative_domain_reader` | Lee contenido completo de un dominio |

## Comandos disponibles

| Comando | Qué hace |
|---|---|
| `scan-stack` | Toma un snapshot del stack del proyecto |
| `remember-it` | Guarda un descubrimiento en la memoria compartida (con args podés forzar un guardado específico del momento) |
| `remember-list` | Lista descubrimientos (solo metadata) |

## Dominios disponibles

Los dominios son **conocimiento pasivo, informativo y consultable** sobre un tema. No son operativos — no le dicen a un agente *cómo* hacer algo (eso es una skill), sino *qué es* algo o *cómo funciona*.

Viven en `.opencode/domains/`. Se consultan bajo demanda con `econative_domain_list` y `econative_domain_reader`. No se inyectan en el prompt.

### Formato

Solo 2 reglas fijas:
1. `$$Título del Dominio$$` en la primera línea
2. `&&Descripción breve&&` en la segunda línea

Después de eso, markdown libre. No hay estructura rígida — el contenido se adapta al tema.

Hay un `_template.md` en `.opencode/domains/` con ejemplos de qué va como dominio y qué no.

### Responsabilidad

| Quién | Qué hace |
|---|---|
| **Usuario** (prioridad alta) | Investiga y cura el dominio. Conocimiento de fondo reusable. |
| **North** (prioridad baja) | Solo escribe si el usuario lo delega. Por defecto consulta y avisa gaps. |

Si North detecta un **gap recurrente de conocimiento**, avisa al usuario para que decida.
Si detecta un **patrón operativo repetitivo**, sugiere crear una skill en vez de un dominio.

## Contexto del proyecto

> Los archivos de contexto viven en `context/` en la **raíz del proyecto** (no en `.opencode/context/`). Se acceden con `econative_context_read` en cualquier momento, o via `econative_start_session` al inicio de sesión.

| Archivo | Propósito | Lo escribe |
|---|---|---|
| `context/PROJECT.md` | Qué es el proyecto, stack, objetivos | North |
| `context/CONVENTIONS.md` | Reglas del repo | North |
| `context/ARCHITECTURE.md` | Arquitectura actual | North |
| `context/STATUS.md` | Estado actual, pendientes, issues | North |

## Memoria del ecosistema

> La memoria vive dentro de `.opencode/Memoria/` — no en la raíz. Es la memoria operativa del ecosistema, no el estado del proyecto.

| Ruta | Propósito | Lo escribe |
|---|---|---|
| `.opencode/Memoria/preferences-user/config.json` | Preferencias del usuario (nombre, idioma) | North via tool |
| `.opencode/Memoria/stack/current.json` | Snapshot actual del stack | North via tool / comando |
| `.opencode/Memoria/stack/snapshots-old/` | Snapshots anteriores del stack | Tool automático |
| `.opencode/Memoria/discoveries/` | Descubrimientos y recuerdos compartidos (fecha, tags, importancia) | North via tool / comando |

## Flujo de inicio de sesión

1. **North** llama **`econative_start_session`**
2. Si `onboarding_required` → pregunta nombre e idioma → `econative_save_preferences`
3. North revisa contexto, stack, memorias y recuerdos
4. North espera la intención del usuario

## Flujo de trabajo

1. **North** recibe intención del usuario
2. **North** consulta skills, dominios y contexto
3. Si la tarea es **compleja** (múltiples tradeoffs, caminos no obvios) → **North** usa `sequential_thinking` para razonar primero
4. **North** planifica con `econative-plan-and-decompose`
5. **North** decide paralelismo y asigna **Executor(s)** con `task()`
6. **Executor** ejecuta aplicando skills correspondientes
7. Si amerita → **North** invoca **Auditor** para revisión
8. **North** decide qué persistir
9. **task-closeout** marca la tarea como completada

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
| **¿Dónde vive?** | SQLite en `~/.config/opencode/` (invisible) | Markdown en `.opencode/Memoria/discoveries/` (visible en el repo) |
| **¿Quién lo ve?** | Solo los agentes | Cualquier developer que abra el repo |
| **¿Para qué sirve?** | Memoria operativa entre sesiones: "qué estábamos haciendo", decisiones de arquitectura | Trazabilidad del proyecto: "esto es importante saber", descubrimientos, configuraciones no obvias |
| **¿Persiste entre sesiones?** | ✅ Sí | ✅ Sí |
| **¿Se trackea en git?** | ❌ No (está fuera del repo) | ✅ Sí (está dentro del proyecto) |
| **Ejemplo de uso** | "Decidimos migrar de Express a Fastify" | "El puerto de desarrollo es 3001, no 3000 — lo cambiamos porque el 3000 está ocupado por el legacy" |

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
