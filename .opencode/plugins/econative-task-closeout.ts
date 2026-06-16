import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { tool } from "@opencode-ai/plugin";
import type { Plugin } from "@opencode-ai/plugin";

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
          let logResult = { ok: false, error: "No active tasks log found" };

          if (existsSync(logFile)) {
            let log: Record<string, unknown>[] = JSON.parse(readFileSync(logFile, "utf-8"));
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
          }

          // ---- Actualizar plan.md ----
          const planPath = join(context.directory, "workspec", "plans", "active", "plan.md");
          let planResult: Record<string, unknown> = { plan_updated: false };
          let phaseCompleted = false;
          let phaseName = "";

          if (existsSync(planPath)) {
            const content = readFileSync(planPath, "utf-8");
            const lines = content.split("\n");
            let changed = false;

            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              // Detectar fase actual
              if (line.startsWith("### ")) {
                phaseName = line.replace("### ", "");
              }

              // Buscar la tarea por nombre en checkbox (activa o completada)
              if ((line.includes("- [ ] ") || line.includes("- [x] ")) && line.includes(args.name)) {
                const clean = line.replace(" 🔵", "");
                if (status === "completed") {
                  lines[i] = clean.replace("- [ ] ", "- [x] ").replace("- [x] ", "- [x] ");
                } else {
                  // cancelled: lo marcamos como cancelado
                  lines[i] = clean.replace("- [ ] ", "- [x] ❌ ").replace("- [x] ", "- [x] ");
                }
                changed = true;
                break;
              }
            }

            if (changed) {
              // Verificar si la fase actual se completó
              let inPhase = false;
              let allDone = true;
              let hasTasks = false;

              for (const line of lines) {
                if (line.startsWith("### ") && line.includes(phaseName)) {
                  inPhase = true;
                  continue;
                }
                if (inPhase && line.startsWith("### ")) break; // siguiente fase
                if (inPhase && line.includes("- [ ] ")) {
                  // Ignorar las canceladas (❌)
                  if (!line.includes("❌")) {
                    allDone = false;
                  }
                  hasTasks = true;
                }
              }

              if (inPhase && hasTasks && allDone) {
                phaseCompleted = true;
              }

              writeFileSync(planPath, lines.join("\n"), "utf-8");

              planResult = {
                plan_updated: true,
                phase_completed: phaseCompleted,
                phase_name: phaseCompleted ? phaseName : undefined,
              };
            }
          }

          return JSON.stringify({
            ...logResult,
            ...planResult,
          });
        },
      }),
    },
  };
}) satisfies Plugin;
