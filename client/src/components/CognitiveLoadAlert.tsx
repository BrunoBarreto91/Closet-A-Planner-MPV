import { Task } from "../../../drizzle/schema";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CognitiveLoadAlertProps {
  tasks: Task[];
  threshold?: number;
}

const EFFORT_POINTS = {
  baixo: 1,
  medio: 2,
  alto: 3,
};

const PRIORITY_BONUS = {
  alta: 1,
  media: 0,
  baixa: 0,
};

export function CognitiveLoadAlert({ tasks, threshold = 10 }: CognitiveLoadAlertProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  // Group tasks by date
  const tasksByDate = tasks.reduce((acc, task) => {
    if (!task.prazo || task.status === "done") return acc;

    const dateKey = format(new Date(task.prazo), "yyyy-MM-dd");
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  // Calculate cognitive load for each date
  const overloadedDates = Object.entries(tasksByDate)
    .map(([dateKey, dateTasks]) => {
      const load = dateTasks.reduce((sum, task) => {
        const effortPoints = EFFORT_POINTS[task.esforco];
        const priorityBonus = PRIORITY_BONUS[task.prioridade];
        return sum + effortPoints + priorityBonus;
      }, 0);

      return {
        dateKey,
        date: new Date(dateKey),
        tasks: dateTasks,
        load,
        isOverloaded: load > threshold,
      };
    })
    .filter((item) => item.isOverloaded && !dismissed.has(item.dateKey))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (overloadedDates.length === 0) return null;

  return (
    <div className="space-y-3">
      {overloadedDates.map((item) => (
        <Alert
          key={item.dateKey}
          className="bg-warning/20 border-warning/50 relative"
        >
          <AlertTriangle className="h-5 w-5 text-warning-foreground" />
          <AlertTitle className="text-warning-foreground font-semibold">
            ⚠️ Atenção: Risco de Sobrecarga Cognitiva
          </AlertTitle>
          <AlertDescription className="text-warning-foreground space-y-2">
            <p>
              Você agendou <strong>{item.load} pontos de esforço</strong> para{" "}
              <strong>{format(item.date, "dd/MM/yyyy (EEEE)", { locale: ptBR })}</strong>.
            </p>
            <p className="text-sm">
              {item.tasks.length} tarefas agendadas. Recomendamos redistribuir algumas
              tarefas não-críticas para manter um ritmo sustentável.
            </p>

            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                className="bg-background/50 hover:bg-background"
                onClick={() => {
                  // TODO: Implement redistribution suggestions
                  alert("Funcionalidade de redistribuição em desenvolvimento");
                }}
              >
                Ver Sugestões de Redistribuição
              </Button>
              <Button
                size="sm"
                variant="ghost"
              onClick={() => {
                setDismissed((prev) => new Set([...Array.from(prev), item.dateKey]));
              }}
              >
                <X className="w-4 h-4 mr-1" />
                Ignorar
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
