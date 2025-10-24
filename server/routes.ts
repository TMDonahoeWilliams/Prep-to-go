import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { setupDevAuth, isDevAuthenticated } from "./devAuth";
import { requirePaidAccess } from "./paymentMiddleware";
import { registerUser, loginUser, logoutUser, requireAuth, attachUser } from "./auth";
import { insertTaskSchema, updateTaskSchema, insertDocumentSchema, updateDocumentSchema, registerUserSchema, loginUserSchema } from "@shared/schema";
import { z } from "zod";
import session from 'express-session';
import bcrypt from "bcryptjs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }));

  // Attach user to all requests
  app.use(attachUser);

  // Health check endpoint for deployment (must not conflict with frontend serving)
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'College Prep Organizer' });
  });

  // Debug endpoint to check environment
  app.get('/api/debug', (req, res) => {
    res.json({
      NODE_ENV: process.env.NODE_ENV,
      DEV_AUTH: process.env.DEV_AUTH,
      VERCEL: process.env.VERCEL,
      useDevAuth: process.env.NODE_ENV === 'development' || process.env.DEV_AUTH === 'true'
    });
  });

  // Production authentication routes
  
  // User registration
  app.post('/api/auth/register', async (req, res) => {
    console.log('🔵 Registration endpoint hit:', req.body);
    try {
      const user = await registerUser(req.body);
      console.log('✅ User registered successfully:', user.email);
      // Create session
      (req as any).session.userId = user.id;
      // Return user without password hash
      res.status(201).json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      res.status(400).json({ 
        message: error.message || 'Registration failed',
        errors: error.errors || []
      });
    }
  });

  // User login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const user = await loginUser(req.body);
      // Create session
      (req as any).session.userId = user.id;
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(401).json({ 
        message: error.message || 'Login failed' 
      });
    }
  });

  // User logout
  app.post('/api/auth/logout', requireAuth, async (req: any, res) => {
    try {
      await logoutUser(req);
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Logout failed' });
    }
  });

    // Auth routes
  app.get('/api/auth/user', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password hash
      const { passwordHash, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch('/api/auth/user/role', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { role } = req.body;
      
      if (!role || !['student', 'parent'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const user = await storage.updateUserRole(userId, role);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Seed default tasks for the user after role selection
      try {
        const { seedDefaultTasksForUser } = await import('./seedTasks');
        await seedDefaultTasksForUser(userId);
        console.log(`Default tasks seeded for user ${userId} with role ${role}`);
      } catch (seedError) {
        console.error("Error seeding default tasks:", seedError);
        // Don't fail the role update if task seeding fails
      }
      
      // Return user without password hash
      const { passwordHash, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  // Student invitation routes (for parents)
  app.post('/api/auth/invite-student', requireAuth, async (req: any, res) => {
    try {
      const parentId = req.session.userId;
      const { studentEmail, studentFirstName, studentLastName } = req.body;
      
      // Verify the user is a parent
      const parent = await storage.getUserById(parentId);
      if (!parent || parent.role !== 'parent') {
        return res.status(403).json({ message: "Only parents can invite students" });
      }

      // Check if student already exists
      const existingStudent = await storage.getUserByEmail(studentEmail);
      if (existingStudent) {
        return res.status(400).json({ message: "A user with this email already exists" });
      }

      // Check if there's already a pending invitation
      const existingInvitation = await storage.getPendingInvitation(parentId, studentEmail);
      if (existingInvitation) {
        return res.status(400).json({ message: "An invitation is already pending for this email" });
      }

      // Create invitation
      const invitation = await storage.createStudentInvitation({
        parentId,
        studentEmail,
        studentFirstName,
        studentLastName,
      });

      // TODO: Send email with invitation link
      // For now, we'll return the invitation token for testing
      res.json({ 
        message: "Student invitation created successfully",
        invitationId: invitation.id,
        // Remove token from production - should only be sent via email
        invitationToken: invitation.invitationToken 
      });
    } catch (error) {
      console.error("Error creating student invitation:", error);
      res.status(500).json({ message: "Failed to create invitation" });
    }
  });

  app.get('/api/auth/students', requireAuth, async (req: any, res) => {
    try {
      const parentId = req.session.userId;
      
      // Verify the user is a parent
      const parent = await storage.getUserById(parentId);
      if (!parent || parent.role !== 'parent') {
        return res.status(403).json({ message: "Only parents can view student accounts" });
      }

      const students = await storage.getStudentsForParent(parentId);
      const invitations = await storage.getInvitationsForParent(parentId);
      
      res.json({ students, invitations });
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.post('/api/auth/accept-invitation/:token', async (req, res) => {
    try {
      const { token } = req.params;
      const { email, password, firstName, lastName } = req.body;

      // Find and validate invitation
      const invitation = await storage.getInvitationByToken(token);
      if (!invitation) {
        return res.status(404).json({ message: "Invalid or expired invitation" });
      }

      if (invitation.status !== 'pending') {
        return res.status(400).json({ message: "Invitation has already been used" });
      }

      if (new Date() > invitation.expiresAt) {
        return res.status(400).json({ message: "Invitation has expired" });
      }

      if (email !== invitation.studentEmail) {
        return res.status(400).json({ message: "Email must match the invitation" });
      }

      // Create student account
      const hashedPassword = await bcrypt.hash(password, 10);
      const student = await storage.createUser({
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        role: 'student',
        emailVerified: true, // Auto-verify since invited by parent
      });

      // Create parent-student relationship
      await storage.createParentStudentRelation({
        parentId: invitation.parentId,
        studentId: student.id,
      });

      // Mark invitation as accepted
      await storage.updateInvitationStatus(invitation.id, 'accepted');

      // Seed default tasks for the new student
      try {
        const { seedDefaultTasksForUser } = await import('./seedTasks');
        await seedDefaultTasksForUser(student.id);
        console.log(`Default tasks seeded for new student ${student.id}`);
      } catch (seedError) {
        console.error("Error seeding default tasks for new student:", seedError);
      }

      res.json({ message: "Student account created successfully" });
    } catch (error) {
      console.error("Error accepting invitation:", error);
      res.status(500).json({ message: "Failed to create student account" });
    }
  });

  // Category routes - require payment
  app.get('/api/categories', requireAuth, requirePaidAccess, async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Task routes - require payment
  app.get('/api/tasks', requireAuth, requirePaidAccess, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      let tasksWithCategories = await storage.getUserTasksWithCategories(userId);
      
      // If user has no tasks, seed default tasks
      if (tasksWithCategories.length === 0) {
        try {
          const { seedDefaultTasksForUser } = await import('./seedTasks');
          await seedDefaultTasksForUser(userId);
          console.log(`Default tasks seeded for existing user ${userId}`);
          // Fetch tasks again after seeding
          tasksWithCategories = await storage.getUserTasksWithCategories(userId);
        } catch (seedError) {
          console.error("Error seeding default tasks for existing user:", seedError);
        }
      }
      
      res.json(tasksWithCategories);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get('/api/tasks/stats', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const stats = await storage.getTaskStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching task stats:", error);
      res.status(500).json({ message: "Failed to fetch task stats" });
    }
  });

  app.post('/api/tasks', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { title, description, category, deadline, priority } = req.body;
      
      const newTask = await storage.createTask({
        userId,
        categoryId: category,
        title,
        description,
        dueDate: deadline ? new Date(deadline) : null,
        priority: priority || 'medium',
      });
      
      res.json(newTask);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.get('/api/tasks', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      let tasks = await storage.getUserTasks(userId);
      
      // If user has no tasks, seed default tasks
      if (tasks.length === 0) {
        try {
          const { seedDefaultTasksForUser } = await import('./seedTasks');
          await seedDefaultTasksForUser(userId);
          console.log(`Default tasks seeded for existing user ${userId}`);
          // Fetch tasks again after seeding
          tasks = await storage.getUserTasks(userId);
        } catch (seedError) {
          console.error("Error seeding default tasks for existing user:", seedError);
        }
      }
      
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.patch('/api/tasks/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      const validated = updateTaskSchema.parse(req.body);
      
      const task = await storage.updateTask(userId, id, validated);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete('/api/tasks/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      
      const deleted = await storage.deleteTask(userId, id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Document routes
  app.get('/api/documents', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const documents = await storage.getUserDocuments(userId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post('/api/documents', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const validated = insertDocumentSchema.parse(req.body);
      
      const document = await storage.createDocument({
        ...validated,
        userId,
      });
      
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid document data", errors: error.errors });
      }
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  app.patch('/api/documents/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      const validated = updateDocumentSchema.parse(req.body);
      
      const document = await storage.updateDocument(userId, id, validated);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid document data", errors: error.errors });
      }
      console.error("Error updating document:", error);
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  app.delete('/api/documents/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      
      const deleted = await storage.deleteDocument(userId, id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Payment routes
  app.post('/api/payments/create-payment-intent', async (req, res) => {
    try {
      const { amount, currency, userEmail, priceId } = req.body;

      if (!amount || !currency || !userEmail) {
        return res.status(400).json({ error: 'Missing required payment parameters' });
      }

      const stripe = (await import('./payments')).default;
      const { paymentStorage } = await import('./payments');

      // Create or get customer
      let customer;
      const existingUsers = await paymentStorage.getUserByEmail(userEmail);
      
      if (existingUsers.length > 0) {
        // Get existing customer or create new one
        const customers = await stripe.customers.list({
          email: userEmail,
          limit: 1,
        });
        
        if (customers.data.length > 0) {
          customer = customers.data[0];
        } else {
          customer = await stripe.customers.create({
            email: userEmail,
            metadata: {
              userId: existingUsers[0].id,
            },
          });
        }
      } else {
        return res.status(400).json({ error: 'User not found' });
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        customer: customer.id,
        metadata: {
          userEmail,
          priceId,
          userId: existingUsers[0].id,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      console.error('Payment intent creation error:', error);
      res.status(500).json({ error: 'Failed to create payment intent' });
    }
  });

  // Webhook for Stripe events
  app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
      const stripe = (await import('./payments')).default;
      const { paymentStorage } = await import('./payments');
      
      const sig = req.headers['stripe-signature'] as string;
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!endpointSecret) {
        console.error('Stripe webhook secret not configured');
        return res.status(400).send('Webhook secret not configured');
      }

      let event;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return res.status(400).send(`Webhook Error: ${err}`);
      }

      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          
          // Record the payment
          await paymentStorage.recordPayment({
            userId: paymentIntent.metadata.userId,
            stripePaymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: 'succeeded',
            description: 'College Prep Organizer Access',
          });

          // Create subscription record for one-time payment
          await paymentStorage.upsertSubscription({
            userId: paymentIntent.metadata.userId,
            stripeCustomerId: paymentIntent.customer as string,
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year access
            cancelAtPeriodEnd: false,
          });

          console.log('Payment succeeded:', paymentIntent.id);
          break;

        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object;
          
          await paymentStorage.recordPayment({
            userId: failedPayment.metadata.userId,
            stripePaymentIntentId: failedPayment.id,
            amount: failedPayment.amount,
            currency: failedPayment.currency,
            status: 'failed',
            description: 'College Prep Organizer Access - Failed',
          });

          console.log('Payment failed:', failedPayment.id);
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  // Check if user has paid access
  app.get('/api/payments/check-access', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { paymentStorage } = await import('./payments');
      
      const hasPaidAccess = await paymentStorage.hasUserPaidAccess(userId);
      
      res.json({ hasPaidAccess });
    } catch (error) {
      console.error('Error checking payment access:', error);
      res.status(500).json({ message: 'Failed to check access' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
