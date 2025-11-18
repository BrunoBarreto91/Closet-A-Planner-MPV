# Closet A Planner MVP - Fase 1 TODO

## Banco de Dados & Modelos

- [x] Criar tabela `tasks` com todos os campos (título, frente, canal, tipo, status, prazo, prioridade, esforço, bloqueador, notas, timestamps)
- [x] Criar tabela `logs` para histórico de mudanças de status
- [x] Criar índices de performance (status, prazo, frente, canal)
- [x] Executar migrations (pnpm db:push)

## API REST

- [x] Implementar `GET /api/trpc/tasks.list` (com filtros: status, prazo, frente, canal)
- [x] Implementar `POST /api/trpc/tasks.create` (criar nova tarefa)
- [x] Implementar `PUT /api/trpc/tasks.update` (atualizar tarefa)
- [x] Implementar `DELETE /api/trpc/tasks.delete` (deletar tarefa)
- [ ] Implementar `GET /api/trpc/tasks.summary` (resumo de carga cognitiva, bloqueadores, métricas)
- [ ] Implementar `POST /api/trpc/tasks.export` (exportar CSV/JSON)

## Input de Linguagem Natural (Adapter IA)

- [x] Criar módulo `server/_core/taskParser.ts` (Adapter Pattern para IA)
- [x] Implementar função `parseNaturalLanguage(input: string)` que chama LLM do Manus
- [x] Estruturar prompt para extrair: título, frente, canal, tipo, status, prazo, prioridade, esforço
- [x] Implementar validação e edge cases (pedir complementação se faltarem informações)
- [x] Criar tRPC procedure `tasks.parseNatural` para preview antes de salvar

## Visualizações (Views)

- [x] Implementar **Kanban Principal** (colunas: To Do, Doing, Blocked, Done)
  - [x] Drag-and-drop entre status
  - [x] Agrupamento opcional por Frente
  - [x] Contador de tarefas por coluna
- [x] Implementar **Lista por Prazo** (ordenação por data, filtros rápidos: Hoje, Amanhã, Esta Semana)
- [x] Implementar **Mobile Rápido** (visão otimizada para celular com FAB)
- [ ] Implementar **Lista de Bloqueadores** (agrupa tarefas bloqueadas)

## Alerta de Carga Cognitiva

- [x] Criar função `calculateCognitiveLoad(tasks: Task[])` (Baixo=1, Médio=2, Alto=3, +1 se Alta prioridade)
- [x] Implementar lógica: se carga > 10 pontos → alerta visual (banner amarelo)
- [ ] Implementar sugestão de redistribuição via IA (mover 2-3 tarefas não-críticas)
- [x] Tornar threshold parametrizável (default 10, sem limitar WIP)

## Rotinas Automáticas

- [ ] Implementar **Rotina Matinal** (8h todos os dias)
  - [ ] Varrer tarefas com prazo Hoje ou Amanhã
  - [ ] Mover tarefas vencidas para Prioridade Alta
  - [ ] Exibir notificação/banner com resumo
- [ ] Implementar **Rotina Semanal** (Segunda 10h)
  - [ ] Gerar página "Sprint Summary"
  - [ ] Contar tarefas concluídas por Frente
  - [ ] Listar tarefas pendentes por Status
  - [ ] Destacar bloqueadores persistentes (>3 dias)
  - [ ] Sugerir 5 prioridades para nova semana

## Gestão de Bloqueadores

- [ ] Campo "Bloqueador" obrigatório quando Status = "Blocked"
- [ ] Ícone 🚧 e cor diferenciada (vermelho claro) no Kanban
- [ ] View separada: "Lista de Bloqueadores"
- [ ] Sugestão IA (Fase 1.5): alerta após 3 dias de bloqueio

## Pré-população de Tarefas

- [x] Criar 15 tarefas pré-definidas (D1-D7)
  - [x] 8 tarefas Frente: Reativação IG
  - [x] 7 tarefas Frente: Canais de Venda
- [x] Seed script para popular banco de dados

## Exportação de Dados

- [x] Implementar export CSV (todas as tarefas + campos meta)
- [x] Implementar export JSON (todas as tarefas + campos meta)
- [x] Botão "Exportar Dados" no menu principal
- [ ] Backup automático semanal (salvo no storage do Manus)

## Design & UX

- [x] Implementar paleta Quiet Luxury (Bege #F5F1E8, Cinza #D4CEBE, Verde menta #9FADA7, Amarelo #FDE68A, Vermelho #FCA5A5)
- [x] Implementar tipografia mobile-first (mín. 16px corpo, 20px+ títulos)
- [x] Implementar componentes reutilizáveis (cards, FAB "+", modal preview)
- [x] Garantir acessibilidade (botões grandes, foco de teclado, fontes legíveis)
- [x] Otimizar para mobile (80% do uso será celular)
- [x] Performance: carregamento <2s

## Documentação

- [ ] Criar README.md com exemplos de uso
- [ ] Documentar Adapter IA (como substituir provider no futuro)
- [ ] Documentar estrutura de APIs REST
- [ ] Criar documentação no Notion (sugestão do usuário)

## Integração GitHub

- [ ] Configurar repositório GitHub com CI/CD
- [ ] Configurar workflows de deploy/test
- [ ] Documentar processo de contribuição

## Testes & Validação

- [ ] Testar input de linguagem natural (85% de precisão)
- [ ] Testar cálculo de carga cognitiva
- [ ] Testar drag-and-drop no Kanban
- [ ] Testar exportação CSV/JSON
- [ ] Testar responsividade mobile
- [ ] Validar performance (<2s carregamento)

## Checkpoint & Entrega

- [ ] Criar checkpoint após completar todas as funcionalidades
- [ ] Revisar briefing e checklist de entregáveis
- [ ] Preparar versão para publicação
- [ ] Entregar ao usuário com instruções de uso

## Bugs Reportados

- [x] Corrigir funcionalidade de Linguagem Natural - aparece mensagem genérica "erro de parsing"

- [ ] Configurar CI/CD com GitHub Actions
- [ ] Fazer push do código para o repositório GitHub conectado
