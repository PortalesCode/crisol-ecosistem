import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { tool } from "@opencode-ai/plugin";
import type { Plugin } from "@opencode-ai/plugin";

export default (async () => {
  return {
    tool: {
      econative_task_init: tool({
        description:
          "Registra una nueva tarea en el log del sistema y la marca en el plan activo como 'en curso'. "
          + "Actualiza workspec/plans/active/plan.md si existe la tarea.",
        args: {
          name: tool.schema.string().describe("Nombre corto de la tarea (kebab-case)"),
          description: tool.schema.string().describe("Descripción de la tarea"),
          assigned_to: tool.schema.string().optional().describe("Agente asignado (executor | auditor)"),
        },
        async execute(args, context) {
          // ---- Log en task-log ----
          const logDir = join(context.directory, ".opencode", "Memoria", "task-log");
          if (!existsSync(logDir)) mkdirSync(logDir, { recursive: true });

          const logFile = join(logDir, "active.json");
          let log: Record<string, unknown>[] = [];
          if (existsSync(logFile)) {
            try { log = JSON.parse(readFileSync(logFile, "utf-8")); } catch { /* ignore */ }
          }

          const task = {
            name: args.name,
            description: args.description,
            assigned_to: args.assigned_to ?? "executor",
            created: new Date().toISOString(),
            status: "active",
          };

          log.push(task);
          writeFileSync(logFile, JSON.stringify(log, null, 2), "utf-8");

          // ---- Marcar en plan.md ----
          const planPath = join(context.directory, "workspec", "plans", "active", "plan.md");
          let planUpdated = false;

          if (existsSync(planPath)) {
            const content = readFileSync(planPath, "utf-8");
            const lines = content.split("\n");
            let changed = false;

            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              // Buscar checkbox con el nombre de la tarea (sin importar si tiene 🔵 ya)
              if ((line.includes("- [ ] ") || line.includes("- [x] ")) && line.includes(args.name)) {
                // Si ya está completada, no la revertimos
                if (line.includes("- [x]")) break;
                // Marcar como activa con indicador visual
                const clean = line.replace(" 🔵", "");
                lines[i] = clean.replace("- [ ] ", "- [ ] 🔵 ");
                changed = true;
                break;
              }
            }

            if (changed) {
              writeFileSync(planPath, lines.join("\n"), "utf-8");
              planUpdated = true;
            }
          }

          const result: Record<string, unknown> = { ok: true, task, active_tasks: log.length };
          if (planUpdated) result.plan_updated = true;
          return JSON.stringify(result);
        },
      }),
    },
  };
}) satisfies Plugin;
