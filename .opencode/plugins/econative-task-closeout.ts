import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { tool } from "@opencode-ai/plugin";
import type { Plugin } from "@opencode-ai/plugin";

export default (async () => {
  return {
    tool: {
      econative_task_closeout: tool({
        description:
          "Marca una tarea como completada o cancelada en el log. NO mueve archivos ni limpia directorios.",
        args: {
          name: tool.schema.string().describe("Nombre de la tarea a cerrar"),
          status: tool.schema.string().optional().describe("Estado final: completed | cancelled (default: completed)"),
        },
        async execute(args, context) {
          const logFile = join(context.directory, ".opencode", "Memoria", "task-log", "active.json");

          if (!existsSync(logFile)) {
            return JSON.stringify({ ok: false, error: "No active tasks log found" });
          }

          const status = args.status ?? "completed";
          let log: Record<string, unknown>[] = JSON.parse(readFileSync(logFile, "utf-8"));
          const taskIdx = log.findIndex((t) => t.name === args.name && t.status === "active");

          if (taskIdx === -1) {
            return JSON.stringify({ ok: false, error: `Task '${args.name}' not found or already closed` });
          }

          log[taskIdx].status = status;
          log[taskIdx].closed_at = new Date().toISOString();
          writeFileSync(logFile, JSON.stringify(log, null, 2), "utf-8");

          return JSON.stringify({ ok: true, task: log[taskIdx], still_active: log.filter((t) => t.status === "active").length });
        },
      }),
    },
  };
}) satisfies Plugin;
