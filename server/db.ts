import { eq, and, desc, gte, lte, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, tasks, taskLogs, Task, InsertTask, TaskLog, InsertTaskLog } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Task queries
export async function createTask(userId: number, task: Omit<InsertTask, 'userId'>): Promise<Task | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create task: database not available");
    return null;
  }

  try {
    const result = await db.insert(tasks).values({
      ...task,
      userId,
    });
    const taskId = result[0].insertId;
    const createdTask = await db.select().from(tasks).where(eq(tasks.id, Number(taskId))).limit(1);
    return createdTask.length > 0 ? createdTask[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create task:", error);
    throw error;
  }
}

export async function getTasksByUserId(userId: number, filters?: {
  status?: string;
  frente?: string;
  canal?: string;
  prazoStart?: Date;
  prazoEnd?: Date;
}): Promise<Task[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get tasks: database not available");
    return [];
  }

  try {
    let query = db.select().from(tasks).where(eq(tasks.userId, userId));

    const conditions = [eq(tasks.userId, userId)];
    
    if (filters?.status) {
      conditions.push(eq(tasks.status, filters.status as any));
    }
    if (filters?.frente) {
      conditions.push(eq(tasks.frente, filters.frente as any));
    }
    if (filters?.canal) {
      conditions.push(eq(tasks.canal, filters.canal as any));
    }
    if (filters?.prazoStart && filters?.prazoEnd) {
      conditions.push(and(
        gte(tasks.prazo, filters.prazoStart),
        lte(tasks.prazo, filters.prazoEnd)
      ) as any);
    }

    const result = await db.select().from(tasks).where(and(...conditions) as any);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get tasks:", error);
    throw error;
  }
}

export async function getTaskById(taskId: number, userId: number): Promise<Task | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get task: database not available");
    return null;
  }

  try {
    const result = await db.select().from(tasks).where(
      and(eq(tasks.id, taskId), eq(tasks.userId, userId)) as any
    ).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get task:", error);
    throw error;
  }
}

export async function updateTask(taskId: number, userId: number, updates: Partial<InsertTask>): Promise<Task | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update task: database not available");
    return null;
  }

  try {
    const task = await getTaskById(taskId, userId);
    if (!task) return null;

    // Log status change if status is being updated
    if (updates.status && updates.status !== task.status) {
      await db.insert(taskLogs).values({
        taskId,
        userId,
        statusAnterior: task.status as any,
        statusNovo: updates.status as any,
        mudanca: `Status changed from ${task.status} to ${updates.status}`,
      });
    }

    await db.update(tasks)
      .set({
        ...updates,
        atualizadoEm: new Date(),
      })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)) as any);

    const updatedTask = await getTaskById(taskId, userId);
    return updatedTask;
  } catch (error) {
    console.error("[Database] Failed to update task:", error);
    throw error;
  }
}

export async function deleteTask(taskId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete task: database not available");
    return false;
  }

  try {
    const task = await getTaskById(taskId, userId);
    if (!task) return false;

    await db.delete(tasks).where(
      and(eq(tasks.id, taskId), eq(tasks.userId, userId)) as any
    );
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete task:", error);
    throw error;
  }
}

export async function getTaskLogs(taskId: number, userId: number): Promise<TaskLog[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get task logs: database not available");
    return [];
  }

  try {
    const result = await db.select().from(taskLogs)
      .where(and(eq(taskLogs.taskId, taskId), eq(taskLogs.userId, userId)) as any)
      .orderBy(desc(taskLogs.criadoEm));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get task logs:", error);
    throw error;
  }
}
