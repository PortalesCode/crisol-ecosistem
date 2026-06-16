# Crisol-Eco

Ecosistema de desarrollo autónomo para OpenCode. North planifica, Executor implementa, Auditor revisa.

## Stack

| Tecnología | Versión | Propósito |
|---|---|---|
| OpenCode | — | Runtime de agentes |
| TypeScript | — | Plugins (tools) |
| Markdown | — | Skills, dominios, contexto |
| GitHub | — | Skill library remota |

## Estructura

```
mi-proyecto/
├── .opencode/              # Ecosistema (agentes, skills, plugins, dominios, memoria)
│   ├── agents/             # North, Executor, Auditor
│   ├── skills/native/      # 9 skills operativas
│   ├── plugins/            # 15 tools TypeScript + _plan-utils.ts
│   ├── domains/            # Conocimiento pasivo consultable
│   └── Memoria/            # Preferencias, stack, descubrimientos
├── workspec/
│   ├── context/            # PROJECT, CONVENTIONS, ARCHITECTURE, STATUS
│   └── plans/              # Plan activo + histórico
├── AGENTS.md               # Fuente de verdad del ecosistema
└── README.md               # Esta documentación
```

## Uso

North maneja todo automáticamente al iniciar sesión. No requiere configuración manual.

## Links

- **Skill library**: [PortalesCode/skill-library](https://github.com/PortalesCode/skill-library)
- **Contexto del proyecto**: `workspec/context/`
