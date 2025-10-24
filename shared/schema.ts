import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  passwordHash: varchar("password_hash").notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { length: 20 }), // 'student' or 'parent' - null initially for role selection
  emailVerified: boolean("email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// User registration schema
export const registerUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

// User login schema
export const loginUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;

// Task categories for college prep
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 20 }).notNull(), // chart-1, chart-2, etc.
  icon: varchar("icon", { length: 50 }), // lucide icon name
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

// Tasks for college prep checklist
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  categoryId: varchar("category_id").notNull().references(() => categories.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  priority: varchar("priority", { length: 20 }).notNull().default('medium'), // 'low', 'medium', 'high', 'urgent'
  status: varchar("status", { length: 20 }).notNull().default('pending'), // 'pending', 'in_progress', 'completed'
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  assignedTo: varchar("assigned_to", { length: 20 }).notNull().default('student'), // 'student' or 'parent' - who is responsible
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

export const updateTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).partial();

// Documents for tracking college-related paperwork
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  taskId: varchar("task_id").references(() => tasks.id, { onDelete: 'set null' }),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 100 }), // 'transcript', 'recommendation', 'fafsa', 'housing', etc.
  status: varchar("status", { length: 20 }).notNull().default('pending'), // 'pending', 'received', 'submitted'
  dueDate: timestamp("due_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const updateDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).partial();

// Relations

export const categoriesRelations = relations(categories, ({ many }) => ({
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [tasks.categoryId],
    references: [categories.id],
  }),
  documents: many(documents),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [documents.taskId],
    references: [tasks.id],
  }),
}));

// Subscriptions table for payment tracking
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  stripeCustomerId: varchar("stripe_customer_id").unique(),
  stripeSubscriptionId: varchar("stripe_subscription_id").unique(),
  stripePriceId: varchar("stripe_price_id"),
  status: varchar("status", { length: 50 }).notNull(), // 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid'
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type UpsertSubscription = typeof subscriptions.$inferInsert;

// Payment history table
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  subscriptionId: varchar("subscription_id").references(() => subscriptions.id, { onDelete: 'cascade' }),
  stripePaymentIntentId: varchar("stripe_payment_intent_id").unique(),
  amount: integer("amount").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).notNull().default('usd'),
  status: varchar("status", { length: 50 }).notNull(), // 'succeeded', 'pending', 'failed'
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Payment = typeof payments.$inferSelect;
export type UpsertPayment = typeof payments.$inferInsert;

// Parent-Student relationships table
export const parentStudentRelations = pgTable("parent_student_relations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parentId: varchar("parent_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  studentId: varchar("student_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

export type ParentStudentRelation = typeof parentStudentRelations.$inferSelect;
export type UpsertParentStudentRelation = typeof parentStudentRelations.$inferInsert;

// Student invitations table (for parents to invite students)
export const studentInvitations = pgTable("student_invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parentId: varchar("parent_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  studentEmail: varchar("student_email").notNull(),
  studentFirstName: varchar("student_first_name").notNull(),
  studentLastName: varchar("student_last_name").notNull(),
  invitationToken: varchar("invitation_token").notNull().unique(),
  status: varchar("status", { length: 20 }).notNull().default('pending'), // 'pending', 'accepted', 'expired'
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type StudentInvitation = typeof studentInvitations.$inferSelect;
export type UpsertStudentInvitation = typeof studentInvitations.$inferInsert;

// Student invitation schema for validation
export const inviteStudentSchema = z.object({
  studentEmail: z.string().email("Invalid email address"),
  studentFirstName: z.string().min(1, "First name is required"),
  studentLastName: z.string().min(1, "Last name is required"),
});

export type InviteStudent = z.infer<typeof inviteStudentSchema>;

// Subscription relations
export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
  subscription: one(subscriptions, {
    fields: [payments.subscriptionId],
    references: [subscriptions.id],
  }),
}));

// Parent-Student relations
export const parentStudentRelationsRelations = relations(parentStudentRelations, ({ one }) => ({
  parent: one(users, {
    fields: [parentStudentRelations.parentId],
    references: [users.id],
  }),
  student: one(users, {
    fields: [parentStudentRelations.studentId],
    references: [users.id],
  }),
}));

export const studentInvitationsRelations = relations(studentInvitations, ({ one }) => ({
  parent: one(users, {
    fields: [studentInvitations.parentId],
    references: [users.id],
  }),
}));

// User relations - add parent/student relationships
export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
  categories: many(categories),
  subscriptions: many(subscriptions),
  payments: many(payments),
  parentRelations: many(parentStudentRelations, { relationName: 'parent' }),
  studentRelations: many(parentStudentRelations, { relationName: 'student' }),
  studentInvitations: many(studentInvitations),
}));
