# Crisol-Eco

Ecosistema autónomo para OpenCode. **North** planifica, **Executor** implementa, **Auditor** revisa.

## Uso

En la raíz de tu proyecto:

```bash
git clone https://github.com/PortalesCode/crisol-ecosistem.git .opencode/
```

Abrís OpenCode y **North** arranca sola. En la primera sesión:
- Crea `workspec/` con contexto, plan y memoria
- Desembarca `AGENTS.md`, `.gitignore` y `opencode.json` a la raíz
- Ya está todo listo

## Requisitos

- [OpenCode](https://opencode.ai)

## Estructura

```
.opencode/
├── agents/        → North, Executor, Auditor
├── plugins/       → Tools del ecosistema
├── skills/        → Skills nativas
├── desembarco/    → Templates para primer inicio
├── AGENTS.md      → Instrucciones para los agentes
├── package.json   → Para compilar plugins si modificás algo
└── README.md      → Este archivo
```
