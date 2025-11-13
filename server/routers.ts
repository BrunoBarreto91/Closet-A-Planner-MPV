import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { createTask, getTasksByUserId, getTaskById, updateTask, deleteTask, getTaskLogs } from "./db";
import { parseNaturalLanguage } from "./_core/taskParser";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  tasks: router({
    list: protectedProcedure
      .input(z.object({
        status: z.enum(["todo", "doing", "blocked", "done"]).optional(),
        frente: z.enum(["reativacao_ig", "canais_venda"]).optional(),
        canal: z.enum(["instagram", "mercado_livre", "shopee", "tiktok_shop"]).optional(),
        prazoStart: z.date().optional(),
        prazoEnd: z.date().optional(),
      }).optional())
      .query(({ ctx, input }) => getTasksByUserId(ctx.user.id, input)),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ ctx, input }) => getTaskById(input.id, ctx.user.id)),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1).max(255),
        frente: z.enum(["reativacao_ig", "canais_venda"]),
        canal: z.enum(["instagram", "mercado_livre", "shopee", "tiktok_shop"]),
        tipo: z.enum(["conteudo", "cadastro_listing", "politicas", "logistica", "criativos_ugc", "ads"]),
        status: z.enum(["todo", "doing", "blocked", "done"]).default("todo"),
        prazo: z.date().optional(),
        prioridade: z.enum(["baixa", "media", "alta"]).default("media"),
        esforco: z.enum(["baixo", "medio", "alto"]).default("medio"),
        bloqueador: z.string().optional(),
        notas: z.string().optional(),
      }))
      .mutation(({ ctx, input }) => createTask(ctx.user.id, input)),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        status: z.enum(["todo", "doing", "blocked", "done"]).optional(),
        prazo: z.date().optional(),
        prioridade: z.enum(["baixa", "media", "alta"]).optional(),
        esforco: z.enum(["baixo", "medio", "alto"]).optional(),
        bloqueador: z.string().optional(),
        notas: z.string().optional(),
      }))
      .mutation(({ ctx, input }) => {
        const { id, ...updates } = input;
        return updateTask(id, ctx.user.id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => deleteTask(input.id, ctx.user.id)),

    logs: protectedProcedure
      .input(z.object({ taskId: z.number() }))
      .query(({ ctx, input }) => getTaskLogs(input.taskId, ctx.user.id)),

    parseNatural: protectedProcedure
      .input(z.object({ input: z.string().min(1) }))
      .mutation(({ ctx, input }) => parseNaturalLanguage(input.input)),
  }),
});

export type AppRouter = typeof appRouter;
