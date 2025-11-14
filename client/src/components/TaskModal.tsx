import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Task } from "../../../drizzle/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  task?: Task;
}

export function TaskModal({ open, onOpenChange, onSuccess, task }: TaskModalProps) {
  const [mode, setMode] = useState<"natural" | "manual">("natural");
  const [naturalInput, setNaturalInput] = useState("");
  const [preview, setPreview] = useState<any>(null);
  const [isParsing, setIsParsing] = useState(false);

  // Manual form state
  const [formData, setFormData] = useState({
    title: task?.title || "",
    frente: task?.frente || "reativacao_ig",
    canal: task?.canal || "instagram",
    tipo: task?.tipo || "conteudo",
    prazo: task?.prazo ? new Date(task.prazo).toISOString().split("T")[0] : "",
    prioridade: task?.prioridade || "media",
    esforco: task?.esforco || "medio",
    bloqueador: task?.bloqueador || "",
    notas: task?.notas || "",
  });

  const parseNatural = trpc.tasks.parseNatural.useMutation();
  const createTask = trpc.tasks.create.useMutation();
  const updateTask = trpc.tasks.update.useMutation();

  const handleParseNatural = async () => {
    if (!naturalInput.trim()) {
      toast.error("Digite uma descrição da tarefa");
      return;
    }

    setIsParsing(true);
    try {
      const result = await parseNatural.mutateAsync({ input: naturalInput });

      if (result.success && result.task) {
        setPreview(result);
        toast.success("Tarefa interpretada com sucesso!");
      } else {
        toast.error(result.preview || "Não foi possível interpretar a tarefa");
      }
    } catch (error) {
      toast.error("Erro ao interpretar tarefa");
    } finally {
      setIsParsing(false);
    }
  };

  const handleCreateFromPreview = async () => {
    if (!preview?.task) return;

    try {
      await createTask.mutateAsync({
        ...preview.task,
        prazo: preview.task.prazo ? new Date(preview.task.prazo) : undefined,
      });
      toast.success("Tarefa criada com sucesso!");
      onSuccess?.();
      handleClose();
    } catch (error) {
      toast.error("Erro ao criar tarefa");
    }
  };

  const handleManualSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Título é obrigatório");
      return;
    }

    try {
      if (task) {
        await updateTask.mutateAsync({
          id: task.id,
          ...formData,
          prazo: formData.prazo ? new Date(formData.prazo) : undefined,
        });
        toast.success("Tarefa atualizada com sucesso!");
      } else {
        await createTask.mutateAsync({
          ...formData,
          prazo: formData.prazo ? new Date(formData.prazo) : undefined,
        } as any);
        toast.success("Tarefa criada com sucesso!");
      }
      onSuccess?.();
      handleClose();
    } catch (error) {
      toast.error(task ? "Erro ao atualizar tarefa" : "Erro ao criar tarefa");
    }
  };

  const handleClose = () => {
    setNaturalInput("");
    setPreview(null);
    setMode("natural");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
          <DialogDescription>
            {mode === "natural"
              ? "Descreva a tarefa em linguagem natural e deixe a IA interpretar"
              : "Preencha os campos manualmente"}
          </DialogDescription>
        </DialogHeader>

        {/* Mode Toggle */}
        {!task && (
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <Button
              variant={mode === "natural" ? "default" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setMode("natural")}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Linguagem Natural
            </Button>
            <Button
              variant={mode === "manual" ? "default" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setMode("manual")}
            >
              Manual
            </Button>
          </div>
        )}

        {/* Natural Language Input */}
        {mode === "natural" && !preview && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Descreva a tarefa</Label>
              <Textarea
                placeholder='Ex: "Post fixado manifesto no IG para hoje alta" ou "Configurar conta Shopee amanhã média logística"'
                value={naturalInput}
                onChange={(e) => setNaturalInput(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            <Button
              onClick={handleParseNatural}
              disabled={isParsing || !naturalInput.trim()}
              className="w-full"
            >
              {isParsing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Interpretando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Interpretar com IA
                </>
              )}
            </Button>
          </div>
        )}

        {/* Preview */}
        {preview && preview.task && (
          <div className="space-y-4">
            <Alert className="bg-primary/10 border-primary/30">
              <Check className="w-4 h-4 text-primary" />
              <AlertDescription className="whitespace-pre-line text-sm">
                {preview.preview}
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button onClick={handleCreateFromPreview} className="flex-1">
                <Check className="w-4 h-4 mr-2" />
                Confirmar e Criar
              </Button>
              <Button variant="outline" onClick={() => setPreview(null)}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setMode("manual");
                setFormData({
                  ...formData,
                  ...preview.task,
                  prazo: preview.task.prazo
                    ? new Date(preview.task.prazo).toISOString().split("T")[0]
                    : "",
                });
                setPreview(null);
              }}
              className="w-full"
            >
              Editar manualmente
            </Button>
          </div>
        )}

        {/* Manual Form */}
        {mode === "manual" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Atualizar bio e destaques"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frente">Frente</Label>
                <Select
                  value={formData.frente}
                  onValueChange={(v) => setFormData({ ...formData, frente: v as any })}
                >
                  <SelectTrigger id="frente">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reativacao_ig">Reativação IG</SelectItem>
                    <SelectItem value="canais_venda">Canais de Venda</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="canal">Canal</Label>
                <Select
                  value={formData.canal}
                  onValueChange={(v) => setFormData({ ...formData, canal: v as any })}
                >
                  <SelectTrigger id="canal">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="mercado_livre">Mercado Livre</SelectItem>
                    <SelectItem value="shopee">Shopee</SelectItem>
                    <SelectItem value="tiktok_shop">TikTok Shop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(v) => setFormData({ ...formData, tipo: v as any })}
                >
                  <SelectTrigger id="tipo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conteudo">Conteúdo</SelectItem>
                    <SelectItem value="cadastro_listing">Cadastro/Listing</SelectItem>
                    <SelectItem value="politicas">Políticas</SelectItem>
                    <SelectItem value="logistica">Logística</SelectItem>
                    <SelectItem value="criativos_ugc">Criativos/UGC</SelectItem>
                    <SelectItem value="ads">Ads</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prazo">Prazo</Label>
                <Input
                  id="prazo"
                  type="date"
                  value={formData.prazo}
                  onChange={(e) => setFormData({ ...formData, prazo: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select
                  value={formData.prioridade}
                  onValueChange={(v) => setFormData({ ...formData, prioridade: v as any })}
                >
                  <SelectTrigger id="prioridade">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="esforco">Esforço</Label>
                <Select
                  value={formData.esforco}
                  onValueChange={(v) => setFormData({ ...formData, esforco: v as any })}
                >
                  <SelectTrigger id="esforco">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixo">Baixo</SelectItem>
                    <SelectItem value="medio">Médio</SelectItem>
                    <SelectItem value="alto">Alto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bloqueador">Bloqueador (opcional)</Label>
              <Input
                id="bloqueador"
                value={formData.bloqueador}
                onChange={(e) => setFormData({ ...formData, bloqueador: e.target.value })}
                placeholder="Ex: Aguardando resposta do fornecedor"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notas">Notas (opcional)</Label>
              <Textarea
                id="notas"
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                placeholder="Informações adicionais..."
                rows={3}
              />
            </div>

            <Button
              onClick={handleManualSubmit}
              disabled={createTask.isPending || updateTask.isPending}
              className="w-full"
            >
              {createTask.isPending || updateTask.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {task ? "Atualizando..." : "Criando..."}
                </>
              ) : (
                <>{task ? "Atualizar Tarefa" : "Criar Tarefa"}</>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
