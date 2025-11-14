import { Task } from "../../../drizzle/schema";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Calendar, AlertCircle, Grip } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  isDragging?: boolean;
}

const frenteLabels = {
  reativacao_ig: "Reativação IG",
  canais_venda: "Canais de Venda",
};

const canalLabels = {
  instagram: "Instagram",
  mercado_livre: "Mercado Livre",
  shopee: "Shopee",
  tiktok_shop: "TikTok Shop",
};

const tipoLabels = {
  conteudo: "Conteúdo",
  cadastro_listing: "Cadastro/Listing",
  politicas: "Políticas",
  logistica: "Logística",
  criativos_ugc: "Criativos/UGC",
  ads: "Ads",
};

const prioridadeColors = {
  baixa: "bg-muted text-muted-foreground",
  media: "bg-secondary text-secondary-foreground",
  alta: "bg-destructive/20 text-destructive-foreground border-destructive/30",
};

const esforcoLabels = {
  baixo: "Baixo",
  medio: "Médio",
  alto: "Alto",
};

export function TaskCard({ task, onClick, isDragging }: TaskCardProps) {
  const isBlocked = task.status === "blocked";
  const isOverdue = task.prazo && new Date(task.prazo) < new Date() && task.status !== "done";

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isDragging ? "opacity-50 rotate-2" : ""
      } ${isBlocked ? "border-destructive/50 bg-destructive/5" : ""} ${
        isOverdue ? "border-warning/50 bg-warning/10" : ""
      }`}
      onClick={onClick}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight mb-2 line-clamp-2">
              {isBlocked && <span className="mr-1">🚧</span>}
              {task.title}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="text-xs">
                {canalLabels[task.canal]}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {tipoLabels[task.tipo]}
              </Badge>
            </div>
          </div>
          <Grip className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-2">
        {/* Prazo */}
        {task.prazo && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className={isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}>
              {format(new Date(task.prazo), "dd/MM/yyyy", { locale: ptBR })}
            </span>
          </div>
        )}

        {/* Bloqueador */}
        {isBlocked && task.bloqueador && (
          <div className="flex items-start gap-2 text-sm bg-destructive/10 p-2 rounded-md">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <span className="text-destructive text-xs line-clamp-2">{task.bloqueador}</span>
          </div>
        )}

        {/* Prioridade e Esforço */}
        <div className="flex items-center gap-2 pt-1">
          <Badge className={`text-xs ${prioridadeColors[task.prioridade]}`}>
            {task.prioridade === "alta" ? "⭐ Alta" : task.prioridade === "media" ? "Média" : "Baixa"}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            💪 {esforcoLabels[task.esforco]}
          </Badge>
        </div>

        {/* Frente */}
        <div className="pt-1">
          <span className="text-xs text-muted-foreground">{frenteLabels[task.frente]}</span>
        </div>
      </CardContent>
    </Card>
  );
}
