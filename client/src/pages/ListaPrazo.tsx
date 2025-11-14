import { useState, useMemo } from "react";
import { TaskModal } from "@/components/TaskModal";
import { CognitiveLoadAlert } from "@/components/CognitiveLoadAlert";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { trpc } from "@/lib/trpc";
import { TaskCard } from "@/components/TaskCard";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, AlertTriangle } from "lucide-react";
import { Task } from "../../../drizzle/schema";
import { startOfDay, endOfDay, addDays, startOfWeek, endOfWeek } from "date-fns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FilterType = "all" | "today" | "tomorrow" | "week" | "overdue";

export default function ListaPrazo() {
  const [filter, setFilter] = useState<FilterType>("today");
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);

  const { data: tasks, isLoading, refetch } = trpc.tasks.list.useQuery({});

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];

    const now = new Date();
    const today = startOfDay(now);
    const tomorrow = startOfDay(addDays(now, 1));
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    return tasks
      .filter((task) => {
        if (!task.prazo) return filter === "all";

        const taskDate = new Date(task.prazo);

        switch (filter) {
          case "today":
            return taskDate >= today && taskDate < endOfDay(today);
          case "tomorrow":
            return taskDate >= tomorrow && taskDate < endOfDay(tomorrow);
          case "week":
            return taskDate >= weekStart && taskDate <= weekEnd;
          case "overdue":
            return taskDate < today && task.status !== "done";
          case "all":
          default:
            return true;
        }
      })
      .sort((a, b) => {
        if (!a.prazo) return 1;
        if (!b.prazo) return -1;
        return new Date(a.prazo).getTime() - new Date(b.prazo).getTime();
      });
  }, [tasks, filter]);

  const overdueCount = useMemo(() => {
    if (!tasks) return 0;
    const today = startOfDay(new Date());
    return tasks.filter(
      (task) => task.prazo && new Date(task.prazo) < today && task.status !== "done"
    ).length;
  }, [tasks]);

  const todayCount = useMemo(() => {
    if (!tasks) return 0;
    const today = startOfDay(new Date());
    return tasks.filter(
      (task) => task.prazo && new Date(task.prazo) >= today && new Date(task.prazo) < endOfDay(today)
    ).length;
  }, [tasks]);

  const tomorrowCount = useMemo(() => {
    if (!tasks) return 0;
    const tomorrow = startOfDay(addDays(new Date(), 1));
    return tasks.filter(
      (task) =>
        task.prazo &&
        new Date(task.prazo) >= tomorrow &&
        new Date(task.prazo) < endOfDay(tomorrow)
    ).length;
  }, [tasks]);

  const weekCount = useMemo(() => {
    if (!tasks) return 0;
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    return tasks.filter(
      (task) =>
        task.prazo &&
        new Date(task.prazo) >= weekStart &&
        new Date(task.prazo) <= weekEnd
    ).length;
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full bg-background">
      {/* Filtros Rápidos */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-3">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="today" className="gap-2">
                Hoje
                {todayCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-primary/20 rounded-full">
                    {todayCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="tomorrow" className="gap-2">
                Amanhã
                {tomorrowCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-primary/20 rounded-full">
                    {tomorrowCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="week" className="gap-2">
                Esta Semana
                {weekCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-primary/20 rounded-full">
                    {weekCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="overdue" className="gap-2">
                <AlertTriangle className="w-4 h-4" />
                Atrasadas
                {overdueCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-destructive/20 text-destructive rounded-full">
                    {overdueCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="all">Todas</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Cognitive Load Alert */}
      {tasks && tasks.length > 0 && (
        <div className="container pt-4">
          <CognitiveLoadAlert tasks={tasks} />
        </div>
      )}

      {/* Lista de Tarefas */}
      <div className="container py-6">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhuma tarefa encontrada
            </h3>
            <p className="text-sm text-muted-foreground">
              Tente selecionar outro filtro ou adicione novas tarefas
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => {
                  setSelectedTask(task);
                  setTaskModalOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task Modal */}
      <TaskModal
        open={taskModalOpen}
        onOpenChange={setTaskModalOpen}
        task={selectedTask}
        onSuccess={() => refetch()}
      />

      {/* Floating Action Button (Mobile) */}
      <FloatingActionButton
        onClick={() => {
          setSelectedTask(undefined);
          setTaskModalOpen(true);
        }}
      />
    </div>
  );
}
