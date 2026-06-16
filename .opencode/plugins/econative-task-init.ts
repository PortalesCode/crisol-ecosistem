import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { tool } from "@opencode-ai/plugin";
import type { Plugin } from "@opencode-ai/plugin";

export default (async () => {
  return {
    tool: {
      econative_task_init: tool({
        description:
          "Registra una nueva tarea en el log del sistema. NO crea directorios ni workspaces.",
        args: {
          name: tool.schema.string().describe("Nombre corto de la tarea (kebab-case)"),
          description: tool.schema.string().describe("Descripción de la tarea"),
          assigned_to: tool.schema.string().optional().describe("Agente asignado (executor | auditor)"),
        },
        async execute(args, context) {
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

          return JSON.stringify({ ok: true, task, active_tasks: log.length });
        },
      }),
    },
  };
}) satisfies Plugin;
