$$Template de Dominio$$
&&Formato de referencia para dominios en Crisol-Eco. Esto NO es un dominio real — es un ejemplo de estructura.&&

<!--
  ===========================================================================
  ¿QUÉ ES UN DOMINIO?
  ===========================================================================
  Un dominio es conocimiento pasivo, informativo y consultable sobre un tema.
  No es operativo — no le dice al agente CÓMO hacer algo (eso es una skill).
  Es conocimiento de referencia: "¿qué es X?", "¿cómo funciona Y?".

  LO ESCRIBE: el usuario (prioridad alta) o North cuando el usuario lo delega
  (prioridad baja). North NO escribe dominios por iniciativa propia — si
  detecta un gap recurrente, avisa al usuario.

  Los dominios se consultan con econative_domain_list y econative_domain_reader.
  No se inyectan en el prompt. Viven en .opencode/domains/.
  ===========================================================================
-->

## ¿Qué tipo de cosas van como dominio?

| Ejemplo | ¿Por qué es dominio? |
|---|---|
| `api-github-rest` | Conocimiento de referencia sobre endpoints, auth, rate limits. No cambia por tarea. |
| `patrones-fastapi` | Cómo funciona dependency injection, routers, modelos. Útil en múltiples tareas. |
| `kdp-publicacion` | Reglas de negocio: formatos aceptados, naming, metadatos. Saber de fondo. |
| `sdd-arquitectura` | Metodología: qué debe contener un SDD. Se consulta cuando se necesita. |

## ¿Qué NO es un dominio?

| Esto... | ...es mejor como |
|---|---|
| "Cómo debuggear este error" | Skill (`econative-debug-systematic`) |
| "El puerto es 3001, no 3000" | Discovery (`econative_remember_it`) |
| "Usamos Ruff para formatear" | Context (`CONVENTIONS.md`) |
| "Qué estamos haciendo ahora" | Context (`STATUS.md`) |

## Formato

Solo hay 2 reglas fijas:

1. **Primera línea:** `$$Título del Dominio$$` — para que `econative_domain_list` lo muestre
2. **Segunda línea:** `&&Descripción breve&&` — para que North entienda de qué trata sin leer todo

Después de eso, **markdown libre**. Sin estructura rígida. El contenido se adapta al tema.
