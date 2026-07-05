# Crisol-Eco

Esqueleto de ecosistema autónomo para proyectos OpenCode.

**Agentes pocos. Skills nativas pocas (operativas). Skills externas muchas (o las necesarias). Dominios simples. Contexto en la raíz del proyecto.**

## Agentes

| Agente | Rol |
|---|---|
| **North** | Orquestador. No toca código. Planifica, delega, decide. |
| **Executor** | Ejecutor técnico. Implementa, refactoriza, debuggea. |
| **Auditor** | Revisor. Analiza riesgos, no modifica código. |

## Skills

### Nativas

Son **patrones operativos** del ecosistema — definen *cómo trabajan los agentes*, no importa el rubro del proyecto. Aunque los nombres suenen a código, describen dinámicas universales: planificar, descomponer, ejecutar, revisar, validar, diagnosticar.

| Skill | Para qué |
|---|---|
| `econative-architecture-review` | Límites, acoplamiento, flujo, impacto |
| `econative-parallel-dispatch` | Detectar independencia y lanzar en paralelo |
| `econative-curacion-dominios` | Curar dominios: detectar gap → investigar → escribir → verificar |
| `econative-debug-systematic` | Debugging metódico |
| `econative-implement-safe` | Implementación segura |
| `econative-test-and-validate` | Testing y validación |
| `econative-audit-review` | Revisión estructurada (6 dimensiones + informe) |

### Externas

Skills de **terceros** y **creadas/customizadas por el usuario** para el proyecto específico. Viven en `skills/extern/`. Separadas de las nativas porque estas son conocimiento del dominio del proyecto, no patrones operativos del ecosistema. Se agregan según necesidad.

## Plugins (tools)

| Tool | Qué hace |
|---|---|
| `econative_start_session` | Inicio obligatorio — carga contexto, memorias, preferences |
| `econative_context_read` | Lee los 4 archivos de contexto (PROJECT, CONVENTIONS, ARCHITECTURE, STATUS) desde `workspec/context/` en la raíz, sin límite de tamaño |
| `econative_plan_read` | Consulta el plan activo — intención, fases, tareas, progreso |
| `econative_plan_sync` | Sincroniza todowrite ↔ plan.md |
| `econative_plan_archive` | Archiva plan completado a old/ y crea nuevo |
| `econative_status` | Vista unificada: contexto + plan + stack + descubrimientos |
| `econative_save_preferences` | Guarda nombre e idioma del usuario |
| `econative_stack_snapshot` | Toma snapshot del stack y archiva versiones anteriores |
| `econative_remember_it` | Guarda recuerdo compartido con fecha e importancia |
| `econative_remember_list` | Lista descubrimientos (solo metadata, sin contenido) |
| `econative_remember_show` | Lee contenido COMPLETO de un descubrimiento por nombre |
| `econative_task_init` | Registra tarea en el log del sistema |
| `econative_task_closeout` | Marca tarea como completada |
| `econative_domain_list` | Escanea dominios y devuelve lista con título y descripción |
| `econative_domain_reader` | Lee dominio por nombre |
| `econative_domain_write` | Crea o actualiza un dominio en workspec/domains/ con el formato simple Crisol-Eco ($$title$$, &&desc&&, markdown libre) |

## Comandos

| Comando | Qué hace |
|---|---|
| `scan-stack` | Toma snapshot del stack del proyecto |
| `remember-it` | Guarda un recuerdo en la memoria compartida |
| `remember-list` | Lista descubrimientos (solo metadata) |

### Hooks

| Plugin | Qué hace |
|---|---|
| `econative-inject-summary.ts` | Inyecta resumen compacto de tools, skills y reglas del Auditor en el system prompt de cada request. No es una tool — es un hook permanente. |

## Estructura

```
.opencode/                   ← Ecosistema (agentes, skills, plugins)
├── AGENTS.md                ← Puerta de entrada
├── agents/                  ← North, Executor, Auditor
├── skills/
│   ├── native/              ← Skills nativas del ecosistema (pocas, operativas)
│   │   ├── north/           ← Skills para North
│   │   └── executor/        ← Skills para Executor
│   └── extern/              ← Skills de terceros + custom del proyecto (según necesidad)
├── plugins/                 ← 16 tools + 1 injector
└── package.json

workspec/                     ← Plan de trabajo, contexto, dominios y memoria del proyecto (en raíz)
├── context/                  ← Documentación del proyecto
│   ├── PROJECT.md            ← Qué es, stack, objetivo
│   ├── CONVENTIONS.md        ← Reglas, estándares
│   ├── ARCHITECTURE.md       ← Patrones, flujo, decisiones
│   ├── STATUS.md             ← Estado actual, pendientes
│   └── SKILL-REGISTRY.md     ← URL del catálogo remoto de skills
├── domains/                  ← Dominios de conocimiento (markdown plano, consultable bajo demanda)
├── plans/
│   ├── active/
│   │   └── plan.md           ← Plan activo
│   └── old/                  ← Planes completados
└── Memoria/                  ← Preferencias, stack, descubrimientos
    ├── preferences-user/     ← Nombre, idioma del usuario
    ├── stack/                ← Snapshots del stack
    │   └── snapshots-old/
    └── discoveries/          ← North escribe automático
```

## Instalación

```bash
cd mi-proyecto/
git clone <repo-url> .opencode
```

(Opcional) Si se quiere contexto inicial:

```bash
mkdir -p workspec/context
# Escribir PROJECT.md, CONVENTIONS.md, ARCHITECTURE.md, STATUS.md
```

Al abrir `mi-proyecto/` en OpenCode:
- Los agentes se cargan desde `.opencode/agents/`
- Las skills en `.opencode/skills/native/` se registran automáticamente
- Los plugins en `.opencode/plugins/` se compilan como tools
- Los dominios se consultan bajo demanda desde `workspec/domains/`
- El contexto del proyecto se lee desde `workspec/context/` (raíz, fuera de `.opencode/`)

## Filosofía

```
North = dirección
Executor = operación
Auditor = control
Skills = cómo trabajar
Domains = qué saber (pasivo, consultable bajo demanda, no se inyecta en el prompt)
Context = estado del proyecto (en workspec/context/, NO dentro de .opencode/)
Memoria = buffer entre efímero y permanente (en workspec/Memoria/, fuera de .opencode/)
Work = trabajo temporal
```

> La memoria pesada queda fuera del ecosistema local.
> Esto es publicable, clonable, mantenible.

## MCPs integrados

> El ecosistema tiene su propio `seq-thinking` (definido en `opencode.json` como local). Los agentes deben usar **este**, no el global.

| MCP | Tool | Propósito | Config |
|---|---|---|---|
| `seq-thinking` (ecosistema) | `sequential_thinking` | Razonamiento estructurado multi-paso solo para tareas complejas | `opencode.json` > `mcp.seq-thinking` |
