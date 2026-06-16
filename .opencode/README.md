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
| `econative-plan-and-decompose` | Intención → Plan → Fases → Tareas |
| `econative-architecture-review` | Límites, acoplamiento, flujo, impacto |
| `econative-parallel-dispatch` | Detectar independencia y lanzar en paralelo |
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
| `econative_context_read` | Lee los 4 archivos de contexto (PROJECT, CONVENTIONS, ARCHITECTURE, STATUS) desde `context/` en raíz, sin límite de tamaño |
| `econative_save_preferences` | Guarda nombre e idioma del usuario |
| `econative_stack_snapshot` | Toma snapshot del stack y archiva versiones anteriores |
| `econative_remember_it` | Guarda recuerdo compartido con fecha e importancia |
| `econative_remember_list` | Lista descubrimientos (solo metadata, sin contenido) |
| `econative_remember_show` | Lee contenido COMPLETO de un descubrimiento por nombre |
| `econative_task_init` | Registra tarea en el log del sistema |
| `econative_task_closeout` | Marca tarea como completada |
| `econative_domain_list` | Escanea dominios y devuelve lista con título y descripción |
| `econative_domain_reader` | Lee dominio por nombre |

## Comandos

| Comando | Qué hace |
|---|---|
| `scan-stack` | Toma snapshot del stack del proyecto |
| `remember-it` | Guarda un recuerdo en la memoria compartida |
| `remember-list` | Lista descubrimientos (solo metadata) |

## Estructura

```
.opencode/                   ← Ecosistema (agentes, skills, plugins, dominios, memoria)
├── AGENTS.md                ← Puerta de entrada
├── agents/                  ← North, Executor, Auditor
├── skills/
│   ├── native/              ← Skills nativas del ecosistema (pocas, operativas)
│   │   ├── north/           ← Skills para North
│   │   └── executor/        ← Skills para Executor
│   └── extern/              ← Skills de terceros + custom del proyecto (según necesidad)
├── plugins/                 ← 11 tools como plugins .ts
├── domains/                 ← Dominios markdown planos (incluye _template.md como referencia de formato)
├── Memoria/
│   ├── preferences-user/    ← Nombre, idioma del usuario
│   ├── stack/               ← Snapshots del stack
│   │   └── snapshots-old/
│   ├── discoveries/         ← North escribe automático
│   └── task-log/            ← Log de tareas activas/completadas
├── commands/
│   ├── scan-stack.md          ← Snapshot del stack
│   ├── remember-it.md         ← Guardar descubrimiento
│   └── remember-list.md       ← Listar descubrimientos
└── package.json

context/                     ← Hermana de .opencode/ — Estado del proyecto (en raíz)
├── PROJECT.md               ← Qué es el proyecto, stack, objetivo
├── CONVENTIONS.md           ← Reglas del repo, estándares
├── ARCHITECTURE.md          ← Patrones, flujo, decisiones arquitectónicas
└── STATUS.md                ← Estado actual, pendientes, issues
```

## Instalación

```bash
cd mi-proyecto/
git clone <repo-url> .opencode
```

(Opcional) Si se quiere contexto inicial:

```bash
mkdir context/
# Escribir PROJECT.md, CONVENTIONS.md, ARCHITECTURE.md, STATUS.md
```

Al abrir `mi-proyecto/` en OpenCode:
- Los agentes se cargan desde `.opencode/agents/`
- Las skills en `.opencode/skills/native/` se registran automáticamente
- Los plugins en `.opencode/plugins/` se compilan como tools
- Los dominios se consultan bajo demanda desde `.opencode/domains/`
- El contexto del proyecto se lee desde `context/` (raíz, fuera de `.opencode/`)

## Filosofía

```
North = dirección
Executor = operación
Auditor = control
Skills = cómo trabajar
Domains = qué saber (pasivo, consultable bajo demanda, no se inyecta en el prompt)
Context = estado del proyecto (en raíz, NO dentro de .opencode/)
Memoria = buffer entre efímero y permanente
Work = trabajo temporal
```

> La memoria pesada queda fuera del ecosistema local.
> Esto es publicable, clonable, mantenible.

## MCPs integrados

> El ecosistema tiene su propio `seq-thinking` (definido en `opencode.json` como local). Los agentes deben usar **este**, no el global.

| MCP | Tool | Propósito | Config |
|---|---|---|---|
| `seq-thinking` (ecosistema) | `sequential_thinking` | Razonamiento estructurado multi-paso solo para tareas complejas | `opencode.json` > `mcp.seq-thinking` |
