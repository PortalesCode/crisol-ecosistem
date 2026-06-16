import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { tool } from "@opencode-ai/plugin";
import type { Plugin } from "@opencode-ai/plugin";
import { updateTaskStatus, getCompletedPhase, addCloseTimestamp, now } from "./_plan-utils.js";

export default (async () => {
  return {
    tool: {
      econative_task_closeout: tool({
        description:
          "Marca una tarea como completada o cancelada en el plan activo "
          + "([ ] → [x] en workspec/plans/active/plan.md). Agrega timestamp de cierre. "
          + "Detecta si la fase se completó.",
        args: {
          name: tool.schema.string().describe("Nombre de la tarea a cerrar"),
          status: tool.schema.string().optional().describe("Estado final: completed | cancelled (default: completed)"),
        },
        async execute(args, context) {
          const status = args.status ?? "completed";
          const validStatus = (["completed", "pending", "cancelled"].includes(status))
            ? status as "completed" | "pending" | "cancelled"
            : "completed";

          // ---- Actualizar plan.md ----
          const planPath = join(context.directory, "workspec", "plans", "active", "plan.md");
          const result: Record<string, unknown> = {
            ok: true,
            task_name: args.name,
            status: validStatus,
            plan_updated: false,
          };

          if (existsSync(planPath)) {
            try {
              const content = readFileSync(planPath, "utf-8");
              let lines = content.split("\n");

              const updateResult = updateTaskStatus(lines, args.name, validStatus);

              if (updateResult.found && updateResult.modifiedIndex !== undefined) {
                lines = updateResult.lines;

                // Agregar timestamp de cierre
                const idx = updateResult.modifiedIndex;
                lines[idx] = addCloseTimestamp(lines[idx], now());

                writeFileSync(planPath, lines.join("\n"), "utf-8");
                result.plan_updated = true;
                result.timestamp_closed = true;

                // Detectar si se completó una fase
                try {
                  const completed = getCompletedPhase(lines);
                  if (completed) {
                    result.phase_completed = true;
                    result.phase_name = completed.phaseName;
                  }
                } catch { /* si falla la detección, ignoramos */ }
              } else {
                result.plan_updated = false;
                result.warning = `Tarea '${args.name}' no encontrada en plan.md`;
              }
            } catch {
              result.plan_updated = false;
              result.error = "Error al actualizar plan.md";
            }
          } else {
            result.error = "No se encontró workspec/plans/active/plan.md";
          }

          return JSON.stringify(result);
        },
      }),
    },
  };
}) satisfies Plugin;
