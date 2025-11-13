import { drizzle } from "drizzle-orm/mysql2";
import { tasks } from "./drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

// Get today's date and calculate D1-D7
const today = new Date();
today.setHours(0, 0, 0, 0);

const getDate = (dayOffset) => {
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
      frente: "reativacao_ig",
      canal: "instagram",
      tipo: "politicas",
      status: "todo",
      prazo: getDate(0), // D1
      prioridade: "alta",
      esforco: "baixo",
      notas: "Destaques: Sobre, Novidades, Como Comprar, Entregas & Trocas, Curadoria, Comunidade",
    },
    {
      userId,
      title: "Post fixado: Manifesto de retorno",
      frente: "reativacao_ig",
      canal: "instagram",
      tipo: "conteudo",
      status: "todo",
      prazo: getDate(0), // D1
      prioridade: "alta",
      esforco: "medio",
      notas: "Carrossel com manifesto de retorno da marca",
    },
    {
      userId,
      title: "Post fixado: FAQ",
      frente: "reativacao_ig",
      canal: "instagram",
      tipo: "conteudo",
      status: "todo",
      prazo: getDate(0), // D1\n      prioridade: "alta",
      esforco: "medio",
      notas: "O que mudou, nicho, prazos de entrega",
    },
    {
      userId,
      title: "Post fixado: Combo Rotina Elegante",
      frente: "reativacao_ig",
      canal: "instagram",
      tipo: "conteudo",
      status: "todo",
      prazo: getDate(1), // D2
      prioridade: "alta",
      esforco: "alto",
      notas: "Multi-categoria (beleza, organização, acessórios)",
    },
    {
      userId,
      title: "Stories: Caixinha de dúvidas + polls",
      frente: "reativacao_ig",
      canal: "instagram",
      tipo: "conteudo",
      status: "todo",
      prazo: getDate(0), // D1-D7
      prioridade: "media",
      esforco: "baixo",
      notas: "Diário por 7 dias",
    },
    {
      userId,
      title: "Script de respostas DMs",
      frente: "reativacao_ig",
      canal: "instagram",
      tipo: "politicas",
      status: "todo",
      prazo: getDate(0), // D1
      prioridade: "alta",
      esforco: "baixo",
      notas: "Mudanças, entregas, trocas",
    },
    {
      userId,
      title: "Programa UGC",
      frente: "reativacao_ig",
      canal: "instagram",
      tipo: "criativos_ugc",
      status: "todo",
      prazo: getDate(1), // D2
      prioridade: "media",
      esforco: "medio",
      notas: "Cupom + hashtag + diretrizes",
    },
    {
      userId,
      title: "2 Reels educativos/semana",
      frente: "reativacao_ig",
      canal: "instagram",
      tipo: "conteudo",
      status: "todo",
      prazo: getDate(2), // D3
      prioridade: "media",
      esforco: "alto",
      notas: "Como usar + detalhe. Repetir em D5",
    },

    // Frente: Canais de Venda (7 tarefas)
    {
      userId,
      title: "Configurar contas e políticas",
      frente: "canais_venda",
      canal: "mercado_livre",
      tipo: "politicas",
      status: "todo",
      prazo: getDate(0), // D1
      prioridade: "alta",
      esforco: "alto",
      notas: "Frete, devolução, coleta/fulfillment em ML, Shopee, TikTok Shop",
    },
    {
      userId,
      title: "Selecionar 3-5 SKUs nacionais",
      frente: "canais_venda",
      canal: "mercado_livre",
      tipo: "cadastro_listing",
      status: "todo",
      prazo: getDate(1), // D2
      prioridade: "alta",
      esforco: "medio",
      notas: "Beleza, organização, acessórios neutros",
    },
    {
      userId,
      title: "Fotos hero + detalhe",
      frente: "canais_venda",
      canal: "mercado_livre",
      tipo: "criativos_ugc",
      status: "todo",
      prazo: getDate(1), // D2
      prioridade: "alta",
      esforco: "alto",
      notas: "Mobile-first",
    },
    {
      userId,
      title: "Criar listings em Mercado Livre",
      frente: "canais_venda",
      canal: "mercado_livre",
      tipo: "cadastro_listing",
      status: "todo",
      prazo: getDate(1), // D2
      prioridade: "alta",
      esforco: "alto",
      notas: "Título SEO, descrição por ocasião, ficha técnica completa",
    },
    {
      userId,
      title: "Criar listings em Shopee",
      frente: "canais_venda",
      canal: "shopee",
      tipo: "cadastro_listing",
      status: "todo",
      prazo: getDate(2), // D3
      prioridade: "alta",
      esforco: "alto",
      notas: "Adaptar para plataforma Shopee",
    },
    {
      userId,
      title: "TikTok Shop: catálogo e políticas",
      frente: "canais_venda",
      canal: "tiktok_shop",
      tipo: "cadastro_listing",
      status: "todo",
      prazo: getDate(2), // D3
      prioridade: "media",
      esforco: "alto",
      notas: "Missões novo seller, afiliados, 2 criativos 'como usar' + 1 unboxing",
    },
    {
      userId,
      title: "Ativar Shopee Ads",
      frente: "canais_venda",
      canal: "shopee",
      tipo: "ads",
      status: "todo",
      prazo: getDate(2), // D3
      prioridade: "media",
      esforco: "baixo",
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
