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
          + "Si la tarea no existe en el plan, la agrega a la última fase activa. "
          + "Actualiza workspec/plans/active/plan.md.",
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
          let taskAdded = false;

          if (existsSync(planPath)) {
            const content = readFileSync(planPath, "utf-8");
            const lines = content.split("\n");
            let changed = false;
            let found = false;

            // Paso 1: buscar la tarea por nombre y marcarla como 🔵
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              const cleanLine = line.replace(" 🔵", "").replace(" ❌", "").trim();
              if (
                (cleanLine.startsWith("- [ ] ") || cleanLine.startsWith("- [x] ")) &&
                (cleanLine.includes(args.name) || cleanLine.toLowerCase().includes(args.description?.toLowerCase()?.slice(0, 30) || ""))
              ) {
                found = true;
                if (line.includes("- [ ]") && !line.includes("[x]")) {
                  lines[i] = line.replace("- [ ] ", "- [ ] 🔵 ").replace(" 🔵 🔵", " 🔵");
                  changed = true;
                }
                break;
              }
            }

            // Paso 2: si no se encontró, agregarla a la última fase
            if (!found) {
              let lastPhaseIdx = -1;
              for (let i = 0; i < lines.length; i++) {
                if (lines[i].trim().startsWith("### ")) {
                  lastPhaseIdx = i;
                }
              }

              if (lastPhaseIdx >= 0) {
                // Encontrar el final de la última fase (próximo ## o ### o fin del archivo)
                let insertIdx = lines.length;
                for (let i = lastPhaseIdx + 1; i < lines.length; i++) {
                  if (lines[i].trim().startsWith("## ") || (lines[i].trim().startsWith("### ") && i !== lastPhaseIdx)) {
                    insertIdx = i;
                    break;
                  }
                }
                // Insertar tarea antes del insertIdx
                const descText = args.description ? ` — ${args.description}` : "";
                lines.splice(insertIdx, 0, `- [ ] 🔵 ${args.name}${descText}`);
                changed = true;
                taskAdded = true;
              }
            }

            if (changed) {
              writeFileSync(planPath, lines.join("\n"), "utf-8");
              planUpdated = true;
            }
          }

          const result: Record<string, unknown> = { ok: true, task, active_tasks: log.length };
          if (planUpdated) result.plan_updated = true;
          if (taskAdded) result.task_added_to_plan = true;
          return JSON.stringify(result);
        },
      }),
    },
  };
}) satisfies Plugin;
