import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { tool } from "@opencode-ai/plugin";
import type { Plugin } from "@opencode-ai/plugin";

export default (async () => {
  return {
    tool: {
      econative_plan_sync: tool({
        description:
          "Sincroniza el plan activo entre todowrite y plan.md. "
          + "Dos direcciones:\n"
          + "  - 'to-todo': Lee plan.md y genera un task list listo para todowrite\n"
          + "  - 'to-plan': Aplica cambios de estado de tareas a plan.md\n"
          + "Resuelve la bisagra entre el tablero efímero (todowrite) y el plan persistente.",
        args: {
          direction: tool.schema.string().describe("Dirección del sync: 'to-todo' | 'to-plan'"),
          tasks: tool.schema.string().optional()
            .describe(
              "[to-plan] JSON array con tareas a actualizar. "
              + "Cada item: { name: string, status: 'completed' | 'pending' | 'cancelled' }. "
              + "Ej: [{\"name\":\"refinar-gitignore\",\"status\":\"completed\"}]"
            ),
        },
        async execute(args, context) {
          const planPath = join(context.directory, "workspec", "plans", "active", "plan.md");

          if (!existsSync(planPath)) {
            return JSON.stringify({
              ok: false,
              error: "No hay plan activo en workspec/plans/active/plan.md",
            });
          }

          const content = readFileSync(planPath, "utf-8");
          const lines = content.split("\n");

          if (args.direction === "to-todo") {
            // Extraer todas las tareas con su estado para todowrite
            const tasks: { text: string; completed: boolean; phase: string }[] = [];
            let currentPhase = "General";

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith("### ")) {
                currentPhase = trimmed.replace("### ", "").replace("**", "").replace("**", "").trim();
              } else if (trimmed.startsWith("- [ ] ")) {
                tasks.push({
                  text: trimmed.replace("- [ ] ", "").replace(" 🔵", "").trim(),
                  completed: false,
                  phase: currentPhase,
                });
              } else if (trimmed.startsWith("- [x] ")) {
                const taskText = trimmed.replace("- [x] ", "").replace(" 🔵", "").replace(" ❌", "").trim();
                tasks.push({
                  text: taskText,
                  completed: true,
                  phase: currentPhase,
                });
              }
            }

            // Generar formato todowrite-ready
            let todoMarkdown = "## Plan Activo — Cargado desde plan.md\n\n";
            let currentPhaseForOutput = "";

            for (const task of tasks) {
              if (task.phase !== currentPhaseForOutput) {
                currentPhaseForOutput = task.phase;
                todoMarkdown += `### ${task.phase}\n`;
              }
              todoMarkdown += `- [${task.completed ? "x" : " "}] ${task.text}\n`;
            }

            todoMarkdown += `\n---\nTotal: ${tasks.length} tareas (${tasks.filter((t) => t.completed).length} completadas)`;

            return JSON.stringify({
              ok: true,
              direction: "to-todo",
              tasks_count: tasks.length,
              completed_count: tasks.filter((t) => t.completed).length,
              todo_format: todoMarkdown,
              message: "Copiá el contenido de 'todo_format' en todowrite para cargar el plan.",
            });
          }

          if (args.direction === "to-plan") {
            if (!args.tasks) {
              return JSON.stringify({ ok: false, error: "Se requiere 'tasks' para direction: 'to-plan'" });
            }

            let updates: { name: string; status: string }[];
            try {
              updates = JSON.parse(args.tasks);
            } catch {
              return JSON.stringify({ ok: false, error: "'tasks' no es un JSON válido" });
            }

            if (!Array.isArray(updates)) {
              return JSON.stringify({ ok: false, error: "'tasks' debe ser un array" });
            }

            let changed = false;
            let found = 0;
            const notFound: string[] = [];

            for (const update of updates) {
              let taskFound = false;
              for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const cleanLine = line.replace(" 🔵", "").replace(" ❌", "").trim();
                if (
                  (cleanLine.startsWith("- [ ] ") || cleanLine.startsWith("- [x] ")) &&
                  (cleanLine.includes(update.name) || cleanLine.toLowerCase().includes(update.name.toLowerCase()))
                ) {
                  taskFound = true;
                  found++;

                  if (update.status === "completed" && cleanLine.startsWith("- [ ] ")) {
                    lines[i] = line.replace("- [ ] ", "- [x] ").replace(" 🔵", "");
                    changed = true;
                  } else if (update.status === "pending" && cleanLine.startsWith("- [x] ")) {
                    lines[i] = line.replace("- [x] ", "- [ ] ").replace(" ❌", "");
                    changed = true;
                  } else if (update.status === "cancelled" && cleanLine.startsWith("- [ ] ")) {
                    lines[i] = line.replace("- [ ] ", "- [x] ").replace(" 🔵", "") + " ❌";
                    changed = true;
                  }
                  break;
                }
              }
              if (!taskFound) {
                notFound.push(update.name);
              }
            }

            if (changed) {
              writeFileSync(planPath, lines.join("\n"), "utf-8");
            }

            return JSON.stringify({
              ok: true,
              direction: "to-plan",
              tasks_processed: updates.length,
              tasks_found: found,
              plan_updated: changed,
              tasks_not_found: notFound.length > 0 ? notFound : undefined,
            });
          }

          return JSON.stringify({
            ok: false,
            error: `Dirección no válida: '${args.direction}'. Usá 'to-todo' o 'to-plan'.`,
          });
        },
      }),
    },
  };
}) satisfies Plugin;
