import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { join, extname, basename, dirname } from "path";
import { tool } from "@opencode-ai/plugin";
import type { Plugin } from "@opencode-ai/plugin";

export default (async () => {
  return {
    tool: {
      econative_start_session: tool({
        description:
          "INICIO OBLIGATORIO DE SESIÓN. North DEBE llamar esta tool al comenzar cada conversación. "
          + "Lee contexto, memorias, stack y preferencias del ecosistema. "
          + "Si no hay preferencias de usuario, devuelve onboarding_required: true. "
          + "Crea workspec/plans/active/plan.md si no existe.",
        args: {},
        async execute(_args, context) {
          const eco = join(context.directory, "workspec");
          const ctxDir = join(context.directory, "workspec/context");
          const memDir = join(eco, "Memoria");
          const domainsDir = join(context.directory, "workspec", "domains");

          const prefsFile = join(memDir, "preferences-user", "config.json");
          const stackFile = join(memDir, "stack", "current.json");
          const discoveriesDir = join(memDir, "discoveries");

          const result: Record<string, unknown> = {
            session_started: new Date().toISOString(),
            onboarding_required: false,
            preferences: null,
            context: {} as Record<string, string>,
            stack: null,
            domains: [] as { name: string; title: string; description: string }[],
            shared_memories_count: 0,
            recent_discoveries: [] as string[],
            plan_created: false,
          };

          // ---- Check preferences ----
          if (!existsSync(prefsFile)) {
            result.onboarding_required = true;
          } else {
            try {
              result.preferences = JSON.parse(readFileSync(prefsFile, "utf-8"));
            } catch {
              result.onboarding_required = true;
            }
          }

          // ---- Auto-create plan.md if it doesn't exist ----
          const planPath = join(context.directory, "workspec", "plans", "active", "plan.md");
          if (!existsSync(planPath)) {
            const planDir = dirname(planPath);
            if (!existsSync(planDir)) mkdirSync(planDir, { recursive: true });

            const template = [
              "# Plan Activo",
              "",
              "## Intención",
              "_pendiente — definir en la próxima sesión_",
              "",
              "---",
              "",
              "## Fases",
              "",
              "### Fase 1: Por definir",
              "- [ ] _primera tarea_",
              "",
              "---",
              "",
              "## Dependencias",
              "",
              "-",
              "",
              "---",
              "",
              "## Notas",
              "",
              "-",
              "",
            ].join("\n");

            writeFileSync(planPath, template, "utf-8");
            result.plan_created = true;
          }

          // ---- Load context/*.md ----
          if (existsSync(ctxDir)) {
            const ctxFiles: Record<string, string> = {};
            const files = readdirSync(ctxDir).filter((f) => extname(f) === ".md");
            for (const file of files) {
              const content = readFileSync(join(ctxDir, file), "utf-8");
              ctxFiles[basename(file, ".md")] = content.slice(0, 3000);
            }
            result.context = ctxFiles;
          }

          // ---- Index domains (titles + descriptions) ----
          if (existsSync(domainsDir)) {
            const files = readdirSync(domainsDir).filter((f) => extname(f).toLowerCase() === ".md");
            result.domains = files.map((file) => {
              const content = readFileSync(join(domainsDir, file), "utf-8");
              let title = basename(file, ".md");
              const titleMatch = content.match(/\$\$(.*?)\$\$/);
              if (titleMatch && titleMatch[1]) title = titleMatch[1].trim();
              let description = "";
              const descMatch = content.match(/&&\s*([\s\S]*?)&&/);
              if (descMatch && descMatch[1]) description = descMatch[1].trim().slice(0, 500);
              return { name: basename(file, ".md"), title, description };
            });
          }

          // ---- Load stack ----
          if (existsSync(stackFile)) {
            try { result.stack = JSON.parse(readFileSync(stackFile, "utf-8")); } catch { /* ignore */ }
          }

          // ---- Count discoveries ----
          if (existsSync(discoveriesDir)) {
            const files = readdirSync(discoveriesDir).filter((f) => extname(f) === ".md");
            result.shared_memories_count = files.length;
          }

          // ---- Recent discoveries (last 5) ----
          if (existsSync(discoveriesDir)) {
            const files = readdirSync(discoveriesDir)
              .filter((f) => extname(f) === ".md")
              .sort().reverse().slice(0, 5);
            result.recent_discoveries = files.map((f) => {
              const content = readFileSync(join(discoveriesDir, f), "utf-8");
              return `## ${basename(f, ".md")}\n${content.slice(0, 500)}`;
            });
          }

          return JSON.stringify(result, null, 2);
        },
      }),
    },
  };
}) satisfies Plugin;
