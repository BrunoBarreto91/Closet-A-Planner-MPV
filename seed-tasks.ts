import { drizzle } from "drizzle-orm/mysql2";
import { tasks } from "./drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

// Get today's date and calculate D1-D7
const today = new Date();
today.setHours(0, 0, 0, 0);

const getDate = (dayOffset: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() + dayOffset);
  return date;
};

const seedTasks = async () => {
  // Owner user ID (will be set to 1 for the first user)
  const userId = 1;

  const tasksToInsert = [
    // Frente: Reativação IG (8 tarefas)
    {
      userId,
      title: "Atualizar bio e destaques",
      frente: "reativacao_ig" as const,
      canal: "instagram" as const,
      tipo: "politicas" as const,
      status: "todo" as const,
      prazo: getDate(0), // D1
      prioridade: "alta" as const,
      esforco: "baixo" as const,
      notas: "Destaques: Sobre, Novidades, Como Comprar, Entregas & Trocas, Curadoria, Comunidade",
    },
    {
      userId,
      title: "Post fixado: Manifesto de retorno",
      frente: "reativacao_ig" as const,
      canal: "instagram" as const,
      tipo: "conteudo" as const,
      status: "todo" as const,
      prazo: getDate(0), // D1
      prioridade: "alta" as const,
      esforco: "medio" as const,
      notas: "Carrossel com manifesto de retorno da marca",
    },
    {
      userId,
      title: "Post fixado: FAQ",
      frente: "reativacao_ig" as const,
      canal: "instagram" as const,
      tipo: "conteudo" as const,
      status: "todo" as const,
      prazo: getDate(0), // D1
      prioridade: "alta" as const,
      esforco: "medio" as const,
      notas: "O que mudou, nicho, prazos de entrega",
    },
    {
      userId,
      title: "Post fixado: Combo Rotina Elegante",
      frente: "reativacao_ig" as const,
      canal: "instagram" as const,
      tipo: "conteudo" as const,
      status: "todo" as const,
      prazo: getDate(1), // D2
      prioridade: "alta" as const,
      esforco: "alto" as const,
      notas: "Multi-categoria (beleza, organização, acessórios)",
    },
    {
      userId,
      title: "Stories: Caixinha de dúvidas + polls",
      frente: "reativacao_ig" as const,
      canal: "instagram" as const,
      tipo: "conteudo" as const,
      status: "todo" as const,
      prazo: getDate(0), // D1-D7
      prioridade: "media" as const,
      esforco: "baixo" as const,
      notas: "Diário por 7 dias",
    },
    {
      userId,
      title: "Script de respostas DMs",
      frente: "reativacao_ig" as const,
      canal: "instagram" as const,
      tipo: "politicas" as const,
      status: "todo" as const,
      prazo: getDate(0), // D1
      prioridade: "alta" as const,
      esforco: "baixo" as const,
      notas: "Mudanças, entregas, trocas",
    },
    {
      userId,
      title: "Programa UGC",
      frente: "reativacao_ig" as const,
      canal: "instagram" as const,
      tipo: "criativos_ugc" as const,
      status: "todo" as const,
      prazo: getDate(1), // D2
      prioridade: "media" as const,
      esforco: "medio" as const,
      notas: "Cupom + hashtag + diretrizes",
    },
    {
      userId,
      title: "2 Reels educativos/semana",
      frente: "reativacao_ig" as const,
      canal: "instagram" as const,
      tipo: "conteudo" as const,
      status: "todo" as const,
      prazo: getDate(2), // D3
      prioridade: "media" as const,
      esforco: "alto" as const,
      notas: "Como usar + detalhe. Repetir em D5",
    },

    // Frente: Canais de Venda (7 tarefas)
    {
      userId,
      title: "Configurar contas e políticas",
      frente: "canais_venda" as const,
      canal: "mercado_livre" as const,
      tipo: "politicas" as const,
      status: "todo" as const,
      prazo: getDate(0), // D1
      prioridade: "alta" as const,
      esforco: "alto" as const,
      notas: "Frete, devolução, coleta/fulfillment em ML, Shopee, TikTok Shop",
    },
    {
      userId,
      title: "Selecionar 3-5 SKUs nacionais",
      frente: "canais_venda" as const,
      canal: "mercado_livre" as const,
      tipo: "cadastro_listing" as const,
      status: "todo" as const,
      prazo: getDate(1), // D2
      prioridade: "alta" as const,
      esforco: "medio" as const,
      notas: "Beleza, organização, acessórios neutros",
    },
    {
      userId,
      title: "Fotos hero + detalhe",
      frente: "canais_venda" as const,
      canal: "mercado_livre" as const,
      tipo: "criativos_ugc" as const,
      status: "todo" as const,
      prazo: getDate(1), // D2
      prioridade: "alta" as const,
      esforco: "alto" as const,
      notas: "Mobile-first",
    },
    {
      userId,
      title: "Criar listings em Mercado Livre",
      frente: "canais_venda" as const,
      canal: "mercado_livre" as const,
      tipo: "cadastro_listing" as const,
      status: "todo" as const,
      prazo: getDate(1), // D2
      prioridade: "alta" as const,
      esforco: "alto" as const,
      notas: "Título SEO, descrição por ocasião, ficha técnica completa",
    },
    {
      userId,
      title: "Criar listings em Shopee",
      frente: "canais_venda" as const,
      canal: "shopee" as const,
      tipo: "cadastro_listing" as const,
      status: "todo" as const,
      prazo: getDate(2), // D3
      prioridade: "alta" as const,
      esforco: "alto" as const,
      notas: "Adaptar para plataforma Shopee",
    },
    {
      userId,
      title: "TikTok Shop: catálogo e políticas",
      frente: "canais_venda" as const,
      canal: "tiktok_shop" as const,
      tipo: "cadastro_listing" as const,
      status: "todo" as const,
      prazo: getDate(2), // D3
      prioridade: "media" as const,
      esforco: "alto" as const,
      notas: "Missões novo seller, afiliados, 2 criativos 'como usar' + 1 unboxing",
    },
    {
      userId,
      title: "Ativar Shopee Ads",
      frente: "canais_venda" as const,
      canal: "shopee" as const,
      tipo: "ads" as const,
      status: "todo" as const,
      prazo: getDate(2), // D3
      prioridade: "media" as const,
      esforco: "baixo" as const,
      notas: "R$ 30-50/dia para descoberta de keywords",
    },
  ];

  try {
    console.log("🌱 Iniciando seed de tarefas...");
    await db.insert(tasks).values(tasksToInsert);
    console.log("✅ 15 tarefas inseridas com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao inserir tarefas:", error);
    process.exit(1);
  }
};

seedTasks();
