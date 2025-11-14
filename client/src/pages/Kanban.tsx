import { useState, useMemo } from "react";
import { TaskModal } from "@/components/TaskModal";
import { CognitiveLoadAlert } from "@/components/CognitiveLoadAlert";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { trpc } from "@/lib/trpc";
import { TaskCard } from "@/components/TaskCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, Filter } from "lucide-react";
import { Task } from "../../../drizzle/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type Status = "todo" | "doing" | "blocked" | "done";

const statusLabels: Record<Status, string> = {
  todo: "A Fazer",
  doing: "Em Andamento",
  blocked: "Bloqueado",
  done: "Concluído",
};

const statusColors: Record<Status, string> = {
  todo: "bg-muted",
  doing: "bg-primary/10",
  blocked: "bg-destructive/10",
  done: "bg-accent/20",
};

export default function Kanban() {
  const [selectedFrente, setSelectedFrente] = useState<string>("all");
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<Status | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);

  const { data: tasks, isLoading, refetch } = trpc.tasks.list.useQuery({});
  const updateTask = trpc.tasks.update.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    if (selectedFrente === "all") return tasks;
    return tasks.filter((task) => task.frente === selectedFrente);
  }, [tasks, selectedFrente]);

  const tasksByStatus = useMemo(() => {
    const grouped: Record<Status, Task[]> = {
      todo: [],
      doing: [],
      blocked: [],
      done: [],
    };

    filteredTasks.forEach((task) => {
      grouped[task.status as Status].push(task);
    });

    return grouped;
  }, [filteredTasks]);

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent, status: Status) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: Status) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null);
      return;
    }

    await updateTask.mutateAsync({
      id: draggedTask.id,
      status: newStatus,
    });

    setDraggedTask(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full bg-background">
      {/* Filtros e Ações */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedFrente} onValueChange={setSelectedFrente}>
              <SelectTrigger className="w-[180px] sm:w-[200px]">
                <SelectValue placeholder="Todas as frentes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as frentes</SelectItem>
                <SelectItem value="reativacao_ig">Reativação IG</SelectItem>
                <SelectItem value="canais_venda">Canais de Venda</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button size="default" className="gap-2" onClick={() => {
            setSelectedTask(undefined);
            setTaskModalOpen(true);
          }}>
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nova Tarefa</span>
          </Button>
        </div>
      </div>

      {/* Cognitive Load Alert */}
      {tasks && tasks.length > 0 && (
        <div className="container pt-4">
          <CognitiveLoadAlert tasks={tasks} />
        </div>
      )}

      {/* Kanban Board */}
      <div className="container py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(statusLabels) as Status[]).map((status) => (
            <div
              key={status}
              className={`flex flex-col rounded-lg border-2 transition-colors ${
                dragOverColumn === status ? "border-primary bg-primary/5" : "border-border"
              } ${statusColors[status]}`}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
            >
              {/* Column Header */}
              <div className="p-4 border-b bg-card/50">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-foreground">{statusLabels[status]}</h2>
                  <Badge variant="secondary" className="ml-2">
                    {tasksByStatus[status].length}
                  </Badge>
                </div>
              </div>

              {/* Tasks */}
              <div className="flex-1 p-3 space-y-3 min-h-[200px]">
                {tasksByStatus[status].length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                    Nenhuma tarefa
                  </div>
                ) : (
                  tasksByStatus[status].map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task)}
                      className="cursor-move"
                    >
                      <TaskCard
                        task={task}
                        isDragging={draggedTask?.id === task.id}
                        onClick={() => {
                          setSelectedTask(task);
                          setTaskModalOpen(true);
                        }}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
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
