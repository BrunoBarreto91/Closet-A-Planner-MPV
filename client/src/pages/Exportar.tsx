import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileJson, FileSpreadsheet, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Exportar() {
  const [exporting, setExporting] = useState<"tasks-csv" | "tasks-json" | "logs-csv" | "logs-json" | null>(null);

  const { data: tasks, isLoading: tasksLoading } = trpc.tasks.list.useQuery({});

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error("Nenhum dado para exportar");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            if (value === null || value === undefined) return "";
            if (value instanceof Date) return format(value, "yyyy-MM-dd HH:mm:ss");
            if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const exportToJSON = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error("Nenhum dado para exportar");
      return;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const handleExportTasks = async (exportFormat: "csv" | "json") => {
    if (!tasks || tasks.length === 0) {
      toast.error("Nenhuma tarefa para exportar");
      return;
    }

    setExporting(exportFormat === "csv" ? "tasks-csv" : "tasks-json");

    try {
      const exportData = tasks.map((task) => ({
        id: task.id,
        titulo: task.title,
        frente: task.frente,
        canal: task.canal,
        tipo: task.tipo,
        status: task.status,
        prazo: task.prazo ? format(new Date(task.prazo), "yyyy-MM-dd") : "",
        prioridade: task.prioridade,
        esforco: task.esforco,
        bloqueador: task.bloqueador || "",
        notas: task.notas || "",
        criado_em: format(new Date(task.criadoEm), "yyyy-MM-dd HH:mm:ss"),
        atualizado_em: format(new Date(task.atualizadoEm), "yyyy-MM-dd HH:mm:ss"),
      }));

      const timestamp = format(new Date(), "yyyyMMdd_HHmmss");
      const filename = `closet-a-tarefas_${timestamp}.${exportFormat}`;

      if (exportFormat === "csv") {
        exportToCSV(exportData, filename);
      } else {
        exportToJSON(exportData, filename);
      }

      toast.success(`Tarefas exportadas com sucesso! (${filename})`);
    } catch (error) {
      toast.error("Erro ao exportar tarefas");
    } finally {
      setExporting(null);
    }
  };

  if (tasksLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full bg-background">
      <div className="container py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Exportar Dados</h1>
          <p className="text-muted-foreground">
            Exporte suas tarefas e logs em formato CSV ou JSON para análise externa ou backup.
          </p>
        </div>

        {/* Export Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Exportar Tarefas
            </CardTitle>
            <CardDescription>
              Todas as tarefas com metadados completos (título, frente, canal, tipo, status, prazo, prioridade, esforço, bloqueador, notas, timestamps)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>{tasks?.length || 0} tarefas disponíveis para exportação</span>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => handleExportTasks("csv")}
                disabled={exporting !== null || !tasks || tasks.length === 0}
                className="gap-2"
              >
                {exporting === "tasks-csv" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4" />
                    Exportar CSV
                  </>
                )}
              </Button>

              <Button
                onClick={() => handleExportTasks("json")}
                disabled={exporting !== null || !tasks || tasks.length === 0}
                variant="outline"
                className="gap-2"
              >
                {exporting === "tasks-json" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <FileJson className="w-4 h-4" />
                    Exportar JSON
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Export Logs (Future) */}
        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Exportar Logs de Mudanças
            </CardTitle>
            <CardDescription>
              Histórico completo de mudanças de status das tarefas (em breve)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled variant="outline" className="gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Em breve
            </Button>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-foreground mb-2">💡 Dica: Use os dados exportados para</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Análise de produtividade no Excel/Google Sheets</li>
              <li>• Integração com ferramentas de BI e dashboards</li>
              <li>• Backup regular dos seus dados</li>
              <li>• Preparação para migração futura (Dashboard 1.5, ERP Core)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
