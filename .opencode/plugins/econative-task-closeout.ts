import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { tool } from "@opencode-ai/plugin";
import type { Plugin } from "@opencode-ai/plugin";
import { updateTaskStatus, getCompletedPhase } from "./_plan-utils.js";

export default (async () => {
  return {
    tool: {
      econative_task_closeout: tool({
        description:
          "Marca una tarea como completada o cancelada en el log y actualiza el plan activo "
          + "([ ] → [x] en workspec/plans/active/plan.md). Detecta si la fase se completó.",
        args: {
          name: tool.schema.string().describe("Nombre de la tarea a cerrar"),
          status: tool.schema.string().optional().describe("Estado final: completed | cancelled (default: completed)"),
        },
        async execute(args, context) {
          const status = args.status ?? "completed";

          // ---- Cerrar en task-log ----
          const logFile = join(context.directory, ".opencode", "Memoria", "task-log", "active.json");
          let logResult: Record<string, unknown> = { ok: false, error: "No active tasks log found" };

          if (existsSync(logFile)) {
            try {
              const log: Record<string, unknown>[] = JSON.parse(readFileSync(logFile, "utf-8"));
              const taskIdx = log.findIndex((t) => t.name === args.name && t.status === "active");

              if (taskIdx === -1) {
                logResult = { ok: false, error: `Task '${args.name}' not found or already closed` };
              } else {
                log[taskIdx].status = status;
                log[taskIdx].closed_at = new Date().toISOString();
                writeFileSync(logFile, JSON.stringify(log, null, 2), "utf-8");
                logResult = {
                  ok: true,
                  task: log[taskIdx],
                  still_active: log.filter((t) => t.status === "active").length,
                };
              }
            } catch {
              logResult = { ok: false, error: "Error al leer task-log" };
            }
          }

          // ---- Actualizar plan.md via plan-utils ----
          const planPath = join(context.directory, "workspec", "plans", "active", "plan.md");
          let planResult: Record<string, unknown> = { plan_updated: false };

          if (existsSync(planPath)) {
            try {
              const content = readFileSync(planPath, "utf-8");
              let lines = content.split("\n");

              const validStatus = (["completed", "pending", "cancelled"].includes(status))
                ? status as "completed" | "pending" | "cancelled"
                : "completed";

              const result = updateTaskStatus(lines, args.name, validStatus);

              if (result.found) {
                lines = result.lines;
                writeFileSync(planPath, lines.join("\n"), "utf-8");

                // Detectar si se completó una fase
                let phaseCompleted = false;
                let phaseName = "";
                try {
                  const completed = getCompletedPhase(lines);
                  if (completed) {
                    phaseCompleted = true;
                    phaseName = completed.phaseName;
                  }
                } catch { /* si falla la detección, ignoramos */ }

                planResult = {
                  plan_updated: true,
                  phase_completed: phaseCompleted,
                  phase_name: phaseCompleted ? phaseName : undefined,
                };
              } else {
                planResult = { plan_updated: false, warning: `Tarea '${args.name}' no encontrada en plan.md` };
              }
            } catch {
              planResult = { plan_updated: false, error: "Error al actualizar plan.md" };
            }
          }

          return JSON.stringify({ ...logResult, ...planResult });
        },
      }),
    },
  };
}) satisfies Plugin;
