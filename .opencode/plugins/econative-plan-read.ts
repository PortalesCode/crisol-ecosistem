import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { tool } from "@opencode-ai/plugin";
import type { Plugin } from "@opencode-ai/plugin";

export default (async () => {
  return {
    tool: {
      econative_plan_read: tool({
        description:
          "Lee el plan activo desde workspec/plans/active/plan.md y devuelve su contenido estructurado: "
          + "intención, fases con tareas y su estado, dependencias y notas. "
          + "Útil para que North retome el plan entre sesiones o que el usuario consulte el estado.",
        args: {},
        async execute(_args, context) {
          const planPath = join(context.directory, "workspec", "plans", "active", "plan.md");

          if (!existsSync(planPath)) {
            return JSON.stringify({
              ok: true,
              exists: false,
              summary: "No hay un plan activo. North necesita preguntar la intención al usuario.",
            });
          }

          const content = readFileSync(planPath, "utf-8");
          const lines = content.split("\n");

          // Extraer intención (primera línea después de # Plan Activo y ## Intención)
          let intention = "";
          const phases: { name: string; tasks: { text: string; completed: boolean }[] }[] = [];
          let dependencies = "";
          let notes = "";
          let currentSection = "";
          let currentPhase = "";

          for (const line of lines) {
            const trimmed = line.trim();

            if (trimmed.startsWith("## Intención")) {
              currentSection = "intention";
              continue;
            }
            if (trimmed.startsWith("## Fases") || trimmed.startsWith("### Fases")) {
              currentSection = "phases";
              continue;
            }
            if (trimmed.startsWith("## Dependencias") || trimmed.startsWith("### Dependencias")) {
              currentSection = "dependencies";
              continue;
            }
            if (trimmed.startsWith("## Notas") || trimmed.startsWith("### Notas")) {
              currentSection = "notes";
              continue;
            }

            if (currentSection === "intention" && trimmed && !trimmed.startsWith("#") && !trimmed.startsWith("---")) {
              intention = trimmed;
              currentSection = "";
              continue;
            }

            if (currentSection === "phases") {
              if (trimmed.startsWith("### ")) {
                currentPhase = trimmed.replace("### ", "").replace("**", "").replace("**", "");
                phases.push({ name: currentPhase, tasks: [] });
              } else if (trimmed.startsWith("- [ ]")) {
                if (phases.length > 0) {
                  phases[phases.length - 1].tasks.push({
                    text: trimmed.replace("- [ ]", "").trim(),
                    completed: false,
                  });
                }
              } else if (trimmed.startsWith("- [x]")) {
                if (phases.length > 0) {
                  phases[phases.length - 1].tasks.push({
                    text: trimmed.replace("- [x]", "").trim(),
                    completed: true,
                  });
                }
              }
              continue;
            }

            if (currentSection === "dependencies" && trimmed && !trimmed.startsWith("#")) {
              dependencies += (dependencies ? "\n" : "") + trimmed;
              continue;
            }

            if (currentSection === "notes" && trimmed && !trimmed.startsWith("#")) {
              notes += (notes ? "\n" : "") + trimmed;
            }
          }

          // Construir summary humano
          const totalTasks = phases.reduce((acc, p) => acc + p.tasks.length, 0);
          const completedTasks = phases.reduce((acc, p) => acc + p.tasks.filter((t) => t.completed).length, 0);

          let summary = `📋 ${intention || "Plan activo"}\n\n`;
          for (const phase of phases) {
            const done = phase.tasks.filter((t) => t.completed).length;
            summary += `▸ ${phase.name} (${done}/${phase.tasks.length})\n`;
            for (const task of phase.tasks) {
              summary += `  ${task.completed ? "✅" : "⬜"} ${task.text}\n`;
            }
            summary += "\n";
          }

          if (dependencies) {
            summary += `🔗 Dependencias: ${dependencies}\n\n`;
          }
          if (notes) {
            summary += `📝 Notas: ${notes}\n`;
          }

          summary += `\nProgreso: ${completedTasks}/${totalTasks} tareas completadas`;

          return JSON.stringify({
            ok: true,
            exists: true,
            intention,
            phases,
            dependencies,
            notes,
            stats: {
              totalTasks,
              completedTasks,
              progressPercent: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
            },
            summary,
          }, null, 2);
        },
      }),
    },
  };
}) satisfies Plugin;
