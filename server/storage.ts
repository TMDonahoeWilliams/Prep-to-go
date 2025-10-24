import {
  users,
  categories,
  tasks,
  documents,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Task,
  type InsertTask,
  type Document,
  type InsertDocument,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, lt } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Task operations
  getUserTasks(userId: string): Promise<Task[]>;
  getUserTasksWithCategories(userId: string): Promise<Array<Task & { category: Category | null }>>;
  getTaskById(userId: string, taskId: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(userId: string, taskId: string, updates: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(userId: string, taskId: string): Promise<boolean>;
  getTaskStats(userId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    upcomingTasks: number;
  }>;
  
  // Document operations
  getUserDocuments(userId: string): Promise<Document[]>;
  getDocumentById(userId: string, documentId: string): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(userId: string, documentId: string, updates: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(userId: string, documentId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.sortOrder));
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(categoryData).returning();
    return category;
  }

  // Task operations
  async getUserTasks(userId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt));
  }

  async getUserTasksWithCategories(userId: string): Promise<Array<Task & { category: Category | null }>> {
    const results = await db
      .select({
        task: tasks,
        category: categories,
      })
      .from(tasks)
      .leftJoin(categories, eq(tasks.categoryId, categories.id))
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt));

    return results.map(({ task, category }) => ({
      ...task,
      category,
    }));
  }

  async getTaskById(userId: string, taskId: string): Promise<Task | undefined> {
    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
    return task;
  }

  async createTask(taskData: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(taskData).returning();
    return task;
  }

  async updateTask(userId: string, taskId: string, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();
    return task;
  }

  async deleteTask(userId: string, taskId: string): Promise<boolean> {
    const result = await db
      .delete(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getTaskStats(userId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    upcomingTasks: number;
  }> {
    const userTasks = await this.getUserTasks(userId);
    const now = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    return {
      totalTasks: userTasks.length,
      completedTasks: userTasks.filter(t => t.status === 'completed').length,
      overdueTasks: userTasks.filter(t => 
        t.dueDate && 
        new Date(t.dueDate) < now && 
        t.status !== 'completed'
      ).length,
      upcomingTasks: userTasks.filter(t => 
        t.dueDate && 
        new Date(t.dueDate) >= now && 
        new Date(t.dueDate) <= weekFromNow &&
        t.status !== 'completed'
      ).length,
    };
  }

  // Document operations
  async getUserDocuments(userId: string): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.createdAt));
  }

  async getDocumentById(userId: string, documentId: string): Promise<Document | undefined> {
    const [document] = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, documentId), eq(documents.userId, userId)));
    return document;
  }

  async createDocument(documentData: InsertDocument): Promise<Document> {
    const [document] = await db.insert(documents).values(documentData).returning();
    return document;
  }

  async updateDocument(userId: string, documentId: string, updates: Partial<InsertDocument>): Promise<Document | undefined> {
    const [document] = await db
      .update(documents)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(documents.id, documentId), eq(documents.userId, userId)))
      .returning();
    return document;
  }

  async deleteDocument(userId: string, documentId: string): Promise<boolean> {
    const result = await db
      .delete(documents)
      .where(and(eq(documents.id, documentId), eq(documents.userId, userId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

export const storage = new DatabaseStorage();
