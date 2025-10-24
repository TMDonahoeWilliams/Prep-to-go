import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { setupDevAuth, isDevAuthenticated } from "./devAuth";
import { requirePaidAccess } from "./paymentMiddleware";
import { insertTaskSchema, updateTaskSchema, insertDocumentSchema, updateDocumentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Auth middleware - use dev auth in development, real auth in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  const useDevAuth = isDevelopment || process.env.DEV_AUTH === 'true';
  const authMiddleware = useDevAuth ? isDevAuthenticated : isAuthenticated;

  if (useDevAuth) {
    console.log("🔧 Using development authentication");
    await setupDevAuth(app);
  } else {
    console.log("🔐 Using production authentication");
    await setupAuth(app);
  }

  // Fallback login route in case auth setup doesn't work
  app.get('/api/login-fallback', async (req: any, res) => {
    console.log("🔄 Fallback login route accessed");
    
    // If using dev auth, simulate user session
    if (useDevAuth) {
      try {
        // Create the dev user if it doesn't exist
        const { storage } = await import('./storage');
        await storage.upsertUser({
          id: "dev-user-123",
          email: "dev@example.com", 
          firstName: "Development",
          lastName: "User",
          profileImageUrl: null,
        });
        console.log("✅ Dev user created/verified");
      } catch (error) {
        console.error("❌ Error with dev user:", error);
      }
    }
    
    res.redirect('/');
  });

    // Auth routes
  app.get('/api/auth/user', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch('/api/auth/user/role', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { role } = req.body;
      
      if (!role || !['student', 'parent'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const user = await storage.updateUserRole(userId, role);
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  // Category routes - require payment
  app.get('/api/categories', authMiddleware, requirePaidAccess, async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Task routes - require payment
  app.get('/api/tasks', authMiddleware, requirePaidAccess, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tasksWithCategories = await storage.getUserTasksWithCategories(userId);
      res.json(tasksWithCategories);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get('/api/tasks/stats', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getTaskStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching task stats:", error);
      res.status(500).json({ message: "Failed to fetch task stats" });
    }
  });

  app.post('/api/tasks', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.get('/api/tasks', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tasks = await storage.getUserTasks(userId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.patch('/api/tasks/:id', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.delete('/api/tasks/:id', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
  app.get('/api/documents', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const documents = await storage.getUserDocuments(userId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post('/api/documents', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.patch('/api/documents/:id', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.delete('/api/documents/:id', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
  app.get('/api/payments/check-access', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
