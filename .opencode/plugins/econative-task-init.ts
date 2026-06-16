import { writeFileSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { tool } from "@opencode-ai/plugin";
import type { Plugin } from "@opencode-ai/plugin";
import { updateTaskStatus, addTaskToLatestPhase, addCreationTimestamp, now } from "./_plan-utils.js";

export default (async () => {
  return {
    tool: {
      econative_task_init: tool({
        description:
          "Registra una nueva tarea en el plan activo como 'en curso' (🔵). "
          + "Si la tarea existe en plan.md la marca como en curso. Si no existe, la agrega "
          + "a la última fase activa. Incluye timestamp de creación. "
          + "Actualiza workspec/plans/active/plan.md.",
        args: {
          name: tool.schema.string().describe("Nombre corto de la tarea (kebab-case)"),
          description: tool.schema.string().describe("Descripción de la tarea"),
          assigned_to: tool.schema.string().optional().describe("Agente asignado (executor | auditor)"),
        },
        async execute(args, context) {
          const planPath = join(context.directory, "workspec", "plans", "active", "plan.md");
          let planUpdated = false;
          let taskAddedToPlan = false;
          let timestampAdded = false;

          if (existsSync(planPath)) {
            const content = readFileSync(planPath, "utf-8");
            let lines = content.split("\n");

            // Buscar por name primero, después por description
            const searchText = args.description && args.description.length > 5
              ? args.description.slice(0, 40)
              : args.name;

            let result = updateTaskStatus(lines, searchText, "pending");
            if (!result.found && searchText !== args.name) {
              result = updateTaskStatus(lines, args.name, "pending");
            }

            if (result.found && result.modifiedIndex !== undefined) {
              // Ya existe — marcar como 🔵 y agregar timestamp si no tiene
              const markResult = updateTaskStatus(result.lines, searchText, "pending");
              lines = markResult.lines;

              // Agregar 🔵 y timestamp de creación
              const idx = markResult.modifiedIndex!;
              let line = lines[idx];
              if (!line.includes("🔵")) {
                line = line.replace("- [ ] ", "- [ ] 🔵 ");
              }
              const newLine = addCreationTimestamp(line, now());
              if (newLine !== line) {
                timestampAdded = true;
              }
              lines[idx] = newLine;
              planUpdated = true;
            } else {
              // No existe — agregar a la última fase (addTaskToLatestPhase ya incluye timestamp)
              const addResult = addTaskToLatestPhase(lines, args.name, args.description);
              if (addResult.added) {
                lines = addResult.lines;
                planUpdated = true;
                taskAddedToPlan = true;
                timestampAdded = true;
              }
            }

            if (planUpdated) {
              writeFileSync(planPath, lines.join("\n"), "utf-8");
            }
          }

          const result: Record<string, unknown> = { ok: true };
          result.task_name = args.name;
          result.plan_updated = planUpdated;
          if (taskAddedToPlan) result.task_added_to_plan = true;
          if (timestampAdded) result.timestamp_created = true;
          return JSON.stringify(result);
        },
      }),
    },
  };
}) satisfies Plugin;
