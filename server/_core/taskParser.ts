import { invokeLLM } from "./llm";

/**
 * Adapter Pattern for Natural Language Task Parsing
 * Isolates LLM calls to facilitate future migration to other providers (OpenAI, Anthropic, etc.)
 */

export interface ParsedTask {
  title: string;
  frente: "reativacao_ig" | "canais_venda";
  canal: "instagram" | "mercado_livre" | "shopee" | "tiktok_shop";
  tipo: "conteudo" | "cadastro_listing" | "politicas" | "logistica" | "criativos_ugc" | "ads";
  prazo?: Date;
  prioridade: "baixa" | "media" | "alta";
  esforco: "baixo" | "medio" | "alto";
  bloqueador?: string;
  notas?: string;
}

export interface ParseResult {
  success: boolean;
  task?: ParsedTask;
  preview: string;
  needsConfirmation: boolean;
  missingFields?: string[];
  suggestedValues?: Record<string, any>;
}

const SYSTEM_PROMPT = `You are a task parsing assistant for Closet A Planner, a project management tool for Instagram reactivation and multi-channel sales operations.

Your job is to interpret natural language task descriptions and extract structured information.

**Valid Enums:**
- frente: "reativacao_ig" (Instagram reactivation) or "canais_venda" (Sales channels)
- canal: "instagram", "mercado_livre", "shopee", "tiktok_shop"
- tipo: "conteudo" (Content), "cadastro_listing" (Listing/Catalog), "politicas" (Policies), "logistica" (Logistics), "criativos_ugc" (Creative/UGC), "ads" (Ads)
- prioridade: "baixa" (Low), "media" (Medium), "alta" (High)
- esforco: "baixo" (Low), "medio" (Medium), "alto" (High)

**Parsing Rules:**
1. Always extract a clear, concise title (max 255 chars)
2. Infer frente from context:
   - Instagram-related → "reativacao_ig"
   - Mercado Livre, Shopee, TikTok Shop → "canais_venda"
3. Infer canal from keywords (Instagram, ML, Shopee, TikTok Shop)
4. Infer tipo from task description keywords
5. Parse prazo (deadline) from relative dates like "today", "tomorrow", "next week", "D1", "D2", etc.
   - Return ISO 8601 date format (YYYY-MM-DD)
   - If no date specified, return null
6. Default prioridade to "media" if not specified
7. Default esforco to "medio" if not specified
8. Extract bloqueador (blocker) if mentioned (e.g., "waiting for supplier response")
9. Extract notas (notes) if additional context is provided

**Response Format:**
Return a JSON object with this structure:
{
  "success": true,
  "task": {
    "title": "string",
    "frente": "reativacao_ig" | "canais_venda",
    "canal": "instagram" | "mercado_livre" | "shopee" | "tiktok_shop",
    "tipo": "conteudo" | "cadastro_listing" | "politicas" | "logistica" | "criativos_ugc" | "ads",
    "prazo": "YYYY-MM-DD" | null,
    "prioridade": "baixa" | "media" | "alta",
    "esforco": "baixo" | "medio" | "alto",
    "bloqueador": "string" | null,
    "notas": "string" | null
  },
  "missingFields": [],
  "suggestedValues": {}
}

If parsing fails or critical fields are missing, return:
{
  "success": false,
  "missingFields": ["field1", "field2"],
  "suggestedValues": { "field": "suggested_value" }
}`;

export async function parseNaturalLanguage(input: string): Promise<ParseResult> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Parse this task description: "${input}"`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "task_parser",
          strict: true,
          schema: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              task: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  frente: { type: "string", enum: ["reativacao_ig", "canais_venda"] },
                  canal: { type: "string", enum: ["instagram", "mercado_livre", "shopee", "tiktok_shop"] },
                  tipo: { type: "string", enum: ["conteudo", "cadastro_listing", "politicas", "logistica", "criativos_ugc", "ads"] },
                  prazo: { type: ["string", "null"] },
                  prioridade: { type: "string", enum: ["baixa", "media", "alta"] },
                  esforco: { type: "string", enum: ["baixo", "medio", "alto"] },
                  bloqueador: { type: ["string", "null"] },
                  notas: { type: ["string", "null"] },
                },
                required: ["title", "frente", "canal", "tipo", "prioridade", "esforco"],
              },
              missingFields: { type: "array", items: { type: "string" } },
              suggestedValues: { type: "object" },
            },
            required: ["success"],
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    let contentStr = '';
    if (typeof content === 'string') {
      contentStr = content;
    } else if (Array.isArray(content)) {
      const textContent = content.find((c: any) => c.type === 'text') as any;
      contentStr = textContent?.text || '';
    }
    if (!contentStr) {
      return {
        success: false,
        preview: "Failed to parse task",
        needsConfirmation: false,
        missingFields: ["Unable to parse input"],
      };
    }

    const parsed = JSON.parse(contentStr);

    if (!parsed.success || !parsed.task) {
      return {
        success: false,
        preview: `Missing required fields: ${parsed.missingFields?.join(", ") || "unknown"}`,
        needsConfirmation: true,
        missingFields: parsed.missingFields || [],
        suggestedValues: parsed.suggestedValues || {},
      };
    }

    // Convert prazo string to Date if present
    const task: ParsedTask = {
      title: parsed.task.title,
      frente: parsed.task.frente,
      canal: parsed.task.canal,
      tipo: parsed.task.tipo,
      prazo: parsed.task.prazo ? new Date(parsed.task.prazo) : undefined,
      prioridade: parsed.task.prioridade,
      esforco: parsed.task.esforco,
      bloqueador: parsed.task.bloqueador || undefined,
      notas: parsed.task.notas || undefined,
    };

    // Generate preview text
    const preview = generatePreview(task);

    return {
      success: true,
      task,
      preview,
      needsConfirmation: false,
    };
  } catch (error) {
    console.error("[TaskParser] Error parsing natural language:", error);
    return {
      success: false,
      preview: "Error parsing task. Please try again.",
      needsConfirmation: false,
      missingFields: ["Parse error"],
    };
  }
}

function generatePreview(task: ParsedTask): string {
  const parts = [
    `📌 Título: ${task.title}`,
    `📂 Frente: ${task.frente === "reativacao_ig" ? "Reativação IG" : "Canais de Venda"}`,
    `📱 Canal: ${task.canal}`,
    `🏷️ Tipo: ${task.tipo}`,
    task.prazo ? `📅 Prazo: ${task.prazo.toLocaleDateString("pt-BR")}` : "📅 Prazo: Não definido",
    `⭐ Prioridade: ${task.prioridade}`,
    `💪 Esforço: ${task.esforco}`,
  ];

  if (task.bloqueador) {
    parts.push(`🚧 Bloqueador: ${task.bloqueador}`);
  }

  if (task.notas) {
    parts.push(`📝 Notas: ${task.notas}`);
  }

  return parts.join("\n");
}
