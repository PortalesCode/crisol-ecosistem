import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { tool } from "@opencode-ai/plugin";
import type { Plugin } from "@opencode-ai/plugin";

export default (async () => {
  return {
    tool: {
      econative_plan_archive: tool({
        description:
          "Archiva el plan activo a workspec/plans/old/ con timestamp y crea un nuevo plan.md vacío "
          + "listo para la próxima sesión. Usar cuando un plan se completa.",
        args: {
          new_intention: tool.schema.string().optional()
            .describe("Opcional: intención del nuevo plan. Si se omite, el nuevo plan queda vacío."),
        },
        async execute(args, context) {
          const activeDir = join(context.directory, "workspec", "plans", "active");
          const oldDir = join(context.directory, "workspec", "plans", "old");
          const planPath = join(activeDir, "plan.md");

          // Verificar que exista plan activo
          if (!existsSync(planPath)) {
            return JSON.stringify({
              ok: false,
              error: "No hay plan activo en workspec/plans/active/plan.md para archivar",
            });
          }

          // Leer el plan actual
          const content = readFileSync(planPath, "utf-8");

          // Generar timestamp para el nombre del archivo
          const now = new Date();
          const pad = (n: number) => n.toString().padStart(2, "0");
          const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
          const archiveName = `plan-${timestamp}.md`;
          const archivePath = join(oldDir, archiveName);

          // Asegurar que old/ exista
          if (!existsSync(oldDir)) {
            mkdirSync(oldDir, { recursive: true });
          }

          // Archivar: mover plan.md → old/
          renameSync(planPath, archivePath);

          // Extraer metadata del plan archivado para el reporte
          const lines = content.split("\n");
          let intention = "";
          let completedTasks = 0;
          let totalTasks = 0;

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("- [x] ")) completedTasks++;
            if (trimmed.startsWith("- [ ] ") || trimmed.startsWith("- [x] ")) totalTasks++;
            // Capturar intención (primera línea no-vacía después de ## Intención)
            if (intention === "") {
              const idx = lines.indexOf("## Intención");
              if (idx >= 0) {
                for (let i = idx + 1; i < lines.length; i++) {
                  const t = lines[i].trim();
                  if (t && !t.startsWith("#") && !t.startsWith("-") && !t.startsWith("---")) {
                    intention = t;
                    break;
                  }
                }
              }
            }
          }

          // Crear nuevo plan.md vacío
          let newPlan = "# Plan Activo\n\n## Intención\n";
          if (args.new_intention) {
            newPlan += args.new_intention;
          } else {
            newPlan += "_pendiente — definir en la próxima sesión_";
          }

          newPlan += "\n\n---\n\n## Fases\n\n### Fase 1: Por definir\n- [ ] _primera tarea_\n\n---\n\n## Dependencias\n\n-\n\n---\n\n## Notas\n\n-\n";

          writeFileSync(planPath, newPlan, "utf-8");

          return JSON.stringify({
            ok: true,
            archived: {
              file: archiveName,
              intention: intention || "(no especificada)",
              completed_tasks: completedTasks,
              total_tasks: totalTasks,
              progress: totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}%` : "0%",
            },
            new_plan: {
              intention: args.new_intention || "_pendiente_",
              path: "workspec/plans/active/plan.md",
            },
            message: `Plan archivado como ${archiveName}. Nuevo plan creado.`,
          });
        },
      }),
    },
  };
}) satisfies Plugin;
