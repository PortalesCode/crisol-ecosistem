import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { tool } from "@opencode-ai/plugin";
import type { Plugin } from "@opencode-ai/plugin";
import { updateTaskStatus, addTaskToLatestPhase } from "./_plan-utils.js";

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

          // ---- Sincronizar con plan.md ----
          const planPath = join(context.directory, "workspec", "plans", "active", "plan.md");
          let planUpdated = false;
          let taskAddedToPlan = false;

          if (existsSync(planPath)) {
            const content = readFileSync(planPath, "utf-8");
            let lines = content.split("\n");

            // Buscar por name primero, después por description
            const searchText = args.description && args.description.length > 5
              ? args.description.slice(0, 40)
              : args.name;

            let result = updateTaskStatus(lines, searchText, "pending");
            // Si no encontró por description, buscar por name exacto
            if (!result.found && searchText !== args.name) {
              result = updateTaskStatus(lines, args.name, "pending");
            }

            if (result.found) {
              // Ya existe, marcar como 🔵
              const markResult = updateTaskStatus(result.lines, searchText, "pending");
              lines = markResult.lines;
              // Agregar 🔵 manualmente después del update
              for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes(args.name) && lines[i].includes("- [ ]") && !lines[i].includes("🔵")) {
                  lines[i] = lines[i].replace("- [ ] ", "- [ ] 🔵 ");
                  break;
                }
              }
              planUpdated = true;
            } else {
              // No existe, agregar a la última fase
              const addResult = addTaskToLatestPhase(lines, args.name, args.description);
              if (addResult.added) {
                lines = addResult.lines;
                planUpdated = true;
                taskAddedToPlan = true;
              }
            }

            if (planUpdated) {
              writeFileSync(planPath, lines.join("\n"), "utf-8");
            }
          }

          const result: Record<string, unknown> = { ok: true, task, active_tasks: log.length };
          if (planUpdated) result.plan_updated = true;
          if (taskAddedToPlan) result.task_added_to_plan = true;
          return JSON.stringify(result);
        },
      }),
    },
  };
}) satisfies Plugin;
