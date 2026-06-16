/**
 * _plan-utils.ts — Helper centralizado para parsing y manipulación de plan.md
 * 
 * Todos los plugins que trabajan con workspec/plans/active/plan.md deben usar
 * estas funciones en vez de parsear manualmente. Si el formato de plan.md cambia,
 * solo se actualiza este archivo.
 */

export interface PlanTask {
  text: string;
  completed: boolean;
  inProgress: boolean;
  cancelled: boolean;
}

export interface PlanPhase {
  name: string;
  tasks: PlanTask[];
}

export interface PlanData {
  intention: string;
  phases: PlanPhase[];
  dependencies: string;
  notes: string;
  stats: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    progressPercent: number;
  };
}

/**
 * Parsea el contenido de plan.md y devuelve una estructura limpia.
 * Tolerante a: espacios extra, 🔵, ❌, variaciones de checkbox.
 */
export function parsePlan(content: string): PlanData {
  const lines = content.split("\n");
  const data: PlanData = {
    intention: "",
    phases: [],
    dependencies: "",
    notes: "",
    stats: { totalTasks: 0, completedTasks: 0, inProgressTasks: 0, progressPercent: 0 },
  };

  let currentSection = "";
  let currentPhase: PlanPhase | null = null;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    // Detectar secciones principales
    if (trimmed.startsWith("## Intención")) { currentSection = "intention"; continue; }
    if (trimmed.startsWith("## Fases") || trimmed.startsWith("### Fases")) { currentSection = "phases"; continue; }
    if (trimmed.startsWith("## Dependencias") || trimmed.startsWith("### Dependencias")) { currentSection = "dependencies"; continue; }
    if (trimmed.startsWith("## Notas") || trimmed.startsWith("### Notas")) { currentSection = "notes"; continue; }
    if (trimmed.startsWith("## ")) { currentSection = ""; continue; }

    if (currentSection === "intention" && trimmed && !trimmed.startsWith("#") && !trimmed.startsWith("---")) {
      data.intention = trimmed.replace(/^_+|_+$/g, ""); // sacar _pendiente_ markers
      continue;
    }

    if (currentSection === "phases") {
      // Detectar fase (### Nombre)
      const phaseMatch = trimmed.match(/^###\s+(.+)/);
      if (phaseMatch) {
        if (currentPhase) data.phases.push(currentPhase);
        currentPhase = { name: phaseMatch[1].trim(), tasks: [] };
        continue;
      }

      // Detectar tarea
      const taskMatch = trimmed.match(/^-\s+\[([ xX❌])\]\s*(🔵)?\s*(.+)/);
      if (taskMatch && currentPhase) {
        const isCompleted = taskMatch[1] === "x" || taskMatch[1] === "X";
        const isCancelled = taskMatch[1] === "❌" || trimmed.includes("❌");
        const inProgress = !!taskMatch[2] || trimmed.includes("🔵");
        const text = (taskMatch[3] || "").trim();
        currentPhase.tasks.push({ text, completed: isCompleted || isCancelled, inProgress, cancelled: isCancelled });
      }
      continue;
    }

    if (currentSection === "dependencies" && trimmed && !trimmed.startsWith("#")) {
      data.dependencies += (data.dependencies ? "\n" : "") + trimmed;
      continue;
    }

    if (currentSection === "notes" && trimmed && !trimmed.startsWith("#")) {
      data.notes += (data.notes ? "\n" : "") + trimmed;
    }
  }

  // Cerrar última fase
  if (currentPhase) data.phases.push(currentPhase);

  // Calcular stats
  for (const phase of data.phases) {
    for (const task of phase.tasks) {
      data.stats.totalTasks++;
      if (task.completed) data.stats.completedTasks++;
      if (task.inProgress) data.stats.inProgressTasks++;
    }
  }
  data.stats.progressPercent = data.stats.totalTasks > 0
    ? Math.round((data.stats.completedTasks / data.stats.totalTasks) * 100)
    : 0;

  return data;
}

/**
 * Busca una tarea por nombre en las líneas de plan.md y actualiza su estado.
 * Retorna las líneas modificadas y si encontró la tarea.
 * Búsqueda flexible: por nombre exacto, por substring, case-insensitive.
 */
export function updateTaskStatus(
  lines: string[],
  searchText: string,
  newStatus: "completed" | "pending" | "cancelled"
): { lines: string[]; found: boolean } {
  const result = [...lines];
  let found = false;

  for (let i = 0; i < result.length; i++) {
    const line = result[i];
    const clean = line.replace(/ 🔵/g, "").replace(/ ❌/g, "").trim();

    // Detectar línea de tarea
    const match = clean.match(/^-\s+\[([ xX])\]\s*(.+)/);
    if (!match) continue;

    const taskText = match[2].trim().toLowerCase();
    const search = searchText.toLowerCase();

    // Matchear por substring o inclusión
    if (taskText.includes(search) || search.includes(taskText)) {
      found = true;

      if (newStatus === "completed") {
        result[i] = line
          .replace(/^(-\s+)\[[ xX]\]/, "$1[x]")
          .replace(/ 🔵/g, "")
          .replace(/ ❌/g, "");
      } else if (newStatus === "pending") {
        result[i] = line
          .replace(/^(-\s+)\[[ xX]\]/, "$1[ ]")
          .replace(/ 🔵/g, "")
          .replace(/ ❌/g, "");
      } else if (newStatus === "cancelled") {
        result[i] = line
          .replace(/^(-\s+)\[[ xX]\]/, "$1[x]")
          .replace(/ 🔵/g, "")
          .replace(/\s*$/, "") + " ❌";
      }
      break;
    }
  }

  return { lines: result, found };
}

/**
 * Agrega una tarea a la última fase del plan.
 * Retorna las líneas modificadas y si pudo agregarla.
 */
export function addTaskToLatestPhase(
  lines: string[],
  taskName: string,
  description?: string
): { lines: string[]; added: boolean } {
  const result = [...lines];
  let lastPhaseIdx = -1;

  for (let i = 0; i < result.length; i++) {
    if (result[i].trim().startsWith("### ")) {
      lastPhaseIdx = i;
    }
  }

  if (lastPhaseIdx < 0) return { lines: result, added: false };

  // Encontrar final de la última fase
  let insertIdx = result.length;
  for (let i = lastPhaseIdx + 1; i < result.length; i++) {
    if (result[i].trim().startsWith("## ") || (result[i].trim().startsWith("### ") && i !== lastPhaseIdx)) {
      insertIdx = i;
      break;
    }
  }

  const descText = description ? ` — ${description}` : "";
  result.splice(insertIdx, 0, `- [ ] 🔵 ${taskName}${descText}`);

  return { lines: result, added: true };
}

/**
 * Detecta si una fase está completamente terminada.
 * Devuelve el nombre de la fase si está completa, o null.
 */
export function getCompletedPhase(lines: string[]): { phaseName: string; allDone: boolean } | null {
  const content = lines.join("\n");
  const data = parsePlan(content);

  for (const phase of data.phases) {
    if (phase.tasks.length === 0) continue;
    const allDone = phase.tasks.every((t) => t.completed || t.cancelled);
    if (allDone) return { phaseName: phase.name, allDone: true };
  }

  return null;
}

/**
 * Genera un resumen legible del plan.
 */
export function formatPlanSummary(data: PlanData): string {
  let summary = `📋 ${data.intention || "Plan activo"}\n\n`;

  for (const phase of data.phases) {
    const done = phase.tasks.filter((t) => t.completed || t.cancelled).length;
    const inProg = phase.tasks.filter((t) => t.inProgress).length;
    summary += `▸ ${phase.name} (${done}/${phase.tasks.length}`;
    if (inProg > 0) summary += `, ${inProg} en curso`;
    summary += ")\n";

    for (const task of phase.tasks) {
      const icon = task.cancelled ? "❌" : task.completed ? "✅" : task.inProgress ? "🔄" : "⬜";
      summary += `  ${icon} ${task.text}\n`;
    }
    summary += "\n";
  }

  if (data.dependencies && data.dependencies !== "-") {
    summary += `🔗 Dependencias: ${data.dependencies}\n\n`;
  }
  if (data.notes && data.notes !== "-") {
    summary += `📝 Notas: ${data.notes}\n`;
  }

  summary += `\nProgreso: ${data.stats.completedTasks}/${data.stats.totalTasks} (${data.stats.progressPercent}%)`;
  if (data.stats.inProgressTasks > 0) {
    summary += ` — ${data.stats.inProgressTasks} en ejecución`;
  }

  return summary;
}
