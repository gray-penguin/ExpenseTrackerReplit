// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users;
  categories;
  subcategories;
  expenses;
  expenseAttachments;
  currentUserId;
  currentCategoryId;
  currentSubcategoryId;
  currentExpenseId;
  currentAttachmentId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.categories = /* @__PURE__ */ new Map();
    this.subcategories = /* @__PURE__ */ new Map();
    this.expenses = /* @__PURE__ */ new Map();
    this.expenseAttachments = /* @__PURE__ */ new Map();
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentSubcategoryId = 1;
    this.currentExpenseId = 1;
    this.currentAttachmentId = 1;
    this.initializeMockData();
  }
  async initializeMockData() {
    const mockUsers = [
      {
        name: "Alex Chen",
        username: "alexc",
        email: "alex.chen@example.com",
        avatar: "AC",
        color: "bg-emerald-500",
        defaultCategoryId: "1",
        defaultSubcategoryId: "1",
        defaultStoreLocation: "Downtown"
      },
      {
        name: "Sarah Johnson",
        username: "sarahj",
        email: "sarah.johnson@example.com",
        avatar: "SJ",
        color: "bg-blue-500",
        defaultCategoryId: "2",
        defaultSubcategoryId: "4",
        defaultStoreLocation: "Uptown"
      }
    ];
    for (const user of mockUsers) {
      await this.createUser(user);
    }
    const mockCategories = [
      { name: "Groceries", icon: "ShoppingCart", color: "text-green-600" },
      { name: "Utilities", icon: "Zap", color: "text-yellow-600" },
      { name: "Entertainment", icon: "Music", color: "text-purple-600" },
      { name: "Automobile", icon: "Car", color: "text-blue-600" }
    ];
    for (const category of mockCategories) {
      await this.createCategory(category);
    }
    const mockSubcategories = [
      { name: "Fresh Produce", categoryId: 1 },
      { name: "Meat & Dairy", categoryId: 1 },
      { name: "Pantry Items", categoryId: 1 },
      { name: "Snacks & Beverages", categoryId: 1 },
      { name: "Electricity", categoryId: 2 },
      { name: "Water & Sewer", categoryId: 2 },
      { name: "Internet & Cable", categoryId: 2 },
      { name: "Gas", categoryId: 2 },
      { name: "Movies & Shows", categoryId: 3 },
      { name: "Gaming", categoryId: 3 },
      { name: "Concerts & Events", categoryId: 3 },
      { name: "Subscriptions", categoryId: 3 },
      { name: "Fuel", categoryId: 4 },
      { name: "Maintenance", categoryId: 4 },
      { name: "Insurance", categoryId: 4 },
      { name: "Parking & Tolls", categoryId: 4 }
    ];
    for (const subcategory of mockSubcategories) {
      await this.createSubcategory(subcategory);
    }
    const mockExpenses = [
      {
        userId: 1,
        categoryId: 1,
        subcategoryId: 1,
        amount: "89.45",
        description: "Weekly grocery shopping",
        notes: "Bought fresh vegetables and meat for the week",
        storeName: "Whole Foods Market",
        storeLocation: "Downtown",
        date: "2025-01-18"
      },
      {
        userId: 1,
        categoryId: 4,
        subcategoryId: 13,
        amount: "45.00",
        description: "Gas for car",
        notes: "Filled up the tank",
        storeName: "Shell Station",
        storeLocation: "Main Street",
        date: "2025-01-17"
      },
      {
        userId: 2,
        categoryId: 2,
        subcategoryId: 5,
        amount: "125.50",
        description: "Monthly electricity bill",
        notes: "Higher than usual due to winter heating",
        storeName: "City Electric",
        storeLocation: "",
        date: "2025-01-15"
      },
      {
        userId: 2,
        categoryId: 3,
        subcategoryId: 12,
        amount: "15.99",
        description: "Netflix subscription",
        notes: "Monthly streaming service",
        storeName: "Netflix",
        storeLocation: "Online",
        date: "2025-01-14"
      },
      {
        userId: 1,
        categoryId: 1,
        subcategoryId: 2,
        amount: "67.32",
        description: "Lunch ingredients",
        notes: "Bought items for meal prep",
        storeName: "Trader Joes",
        storeLocation: "Downtown",
        date: "2025-01-16"
      },
      {
        userId: 1,
        categoryId: 3,
        subcategoryId: 9,
        amount: "12.50",
        description: "Movie tickets",
        notes: "Watched the new action movie",
        storeName: "AMC Theater",
        storeLocation: "Downtown",
        date: "2025-01-19"
      },
      {
        userId: 2,
        categoryId: 4,
        subcategoryId: 15,
        amount: "95.00",
        description: "Car insurance payment",
        notes: "Monthly auto insurance",
        storeName: "State Farm",
        storeLocation: "Online",
        date: "2025-01-10"
      }
    ];
    for (const expense of mockExpenses) {
      await this.createExpense(expense);
    }
  }
  // User methods
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async getAllUsers() {
    return Array.from(this.users.values());
  }
  async createUser(insertUser) {
    const id = this.currentUserId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async updateUser(id, updateData) {
    const user = this.users.get(id);
    if (!user) return void 0;
    const updatedUser = { ...user, ...updateData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  async deleteUser(id) {
    return this.users.delete(id);
  }
  // Category methods
  async getAllCategories() {
    return Array.from(this.categories.values());
  }
  async getCategory(id) {
    return this.categories.get(id);
  }
  async createCategory(insertCategory) {
    const id = this.currentCategoryId++;
    const category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }
  async updateCategory(id, updateData) {
    const category = this.categories.get(id);
    if (!category) return void 0;
    const updatedCategory = { ...category, ...updateData };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }
  async deleteCategory(id) {
    return this.categories.delete(id);
  }
  // Subcategory methods
  async getAllSubcategories() {
    return Array.from(this.subcategories.values());
  }
  async getSubcategory(id) {
    return this.subcategories.get(id);
  }
  async getSubcategoriesByCategory(categoryId) {
    return Array.from(this.subcategories.values()).filter(
      (subcategory) => subcategory.categoryId === categoryId
    );
  }
  async createSubcategory(insertSubcategory) {
    const id = this.currentSubcategoryId++;
    const subcategory = { ...insertSubcategory, id };
    this.subcategories.set(id, subcategory);
    return subcategory;
  }
  async updateSubcategory(id, updateData) {
    const subcategory = this.subcategories.get(id);
    if (!subcategory) return void 0;
    const updatedSubcategory = { ...subcategory, ...updateData };
    this.subcategories.set(id, updatedSubcategory);
    return updatedSubcategory;
  }
  async deleteSubcategory(id) {
    return this.subcategories.delete(id);
  }
  // Expense methods
  async getAllExpenses() {
    return Array.from(this.expenses.values());
  }
  async getExpense(id) {
    return this.expenses.get(id);
  }
  async getExpensesByUser(userId) {
    return Array.from(this.expenses.values()).filter(
      (expense) => expense.userId === userId
    );
  }
  async getExpensesByCategory(categoryId) {
    return Array.from(this.expenses.values()).filter(
      (expense) => expense.categoryId === categoryId
    );
  }
  async createExpense(insertExpense) {
    const id = this.currentExpenseId++;
    const expense = {
      ...insertExpense,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.expenses.set(id, expense);
    return expense;
  }
  async updateExpense(id, updateData) {
    const expense = this.expenses.get(id);
    if (!expense) return void 0;
    const updatedExpense = { ...expense, ...updateData };
    this.expenses.set(id, updatedExpense);
    return updatedExpense;
  }
  async deleteExpense(id) {
    return this.expenses.delete(id);
  }
  // Expense attachment methods
  async getExpenseAttachment(id) {
    return this.expenseAttachments.get(id);
  }
  async createExpenseAttachment(insertAttachment) {
    const id = this.currentAttachmentId++;
    const attachment = {
      ...insertAttachment,
      id,
      uploadedAt: /* @__PURE__ */ new Date()
    };
    this.expenseAttachments.set(id, attachment);
    return attachment;
  }
  async deleteExpenseAttachment(id) {
    return this.expenseAttachments.delete(id);
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, integer, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  avatar: text("avatar").notNull(),
  color: text("color").notNull(),
  defaultCategoryId: text("default_category_id"),
  defaultSubcategoryId: text("default_subcategory_id"),
  defaultStoreLocation: text("default_store_location")
});
var categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull()
});
var subcategories = pgTable("subcategories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  categoryId: integer("category_id").notNull()
});
var expenseAttachments = pgTable("expense_attachments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  size: integer("size").notNull(),
  dataUrl: text("data_url").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow()
});
var expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  categoryId: text("category_id").notNull(),
  subcategoryId: text("subcategory_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  notes: text("notes"),
  storeName: text("store_name"),
  storeLocation: text("store_location"),
  date: text("date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true
});
var insertCategorySchema = createInsertSchema(categories).omit({
  id: true
});
var insertSubcategorySchema = createInsertSchema(subcategories).omit({
  id: true
});
var insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true
});
var insertExpenseAttachmentSchema = createInsertSchema(expenseAttachments).omit({
  id: true,
  uploadedAt: true
});

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/health", (req, res) => {
    res.json({
      status: "healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      uptime: process.uptime(),
      version: "1.0.0"
    });
  });
  app2.get("/api/users", async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      res.json(users2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  app2.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });
  app2.post("/api/users", async (req, res) => {
    try {
      const validation = insertUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid user data", details: validation.error });
      }
      const user = await storage.createUser(validation.data);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });
  app2.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validation = insertUserSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid user data", details: validation.error });
      }
      const user = await storage.updateUser(id, validation.data);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });
  app2.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });
  app2.get("/api/categories", async (req, res) => {
    try {
      const categories2 = await storage.getAllCategories();
      res.json(categories2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });
  app2.get("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getCategory(id);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category" });
    }
  });
  app2.post("/api/categories", async (req, res) => {
    try {
      const validation = insertCategorySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid category data", details: validation.error });
      }
      const category = await storage.createCategory(validation.data);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to create category" });
    }
  });
  app2.put("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validation = insertCategorySchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid category data", details: validation.error });
      }
      const category = await storage.updateCategory(id, validation.data);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to update category" });
    }
  });
  app2.delete("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCategory(id);
      if (!deleted) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete category" });
    }
  });
  app2.get("/api/subcategories", async (req, res) => {
    try {
      const { categoryId } = req.query;
      if (categoryId) {
        const subcategories2 = await storage.getSubcategoriesByCategory(parseInt(categoryId));
        res.json(subcategories2);
      } else {
        const subcategories2 = await storage.getAllSubcategories();
        res.json(subcategories2);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subcategories" });
    }
  });
  app2.get("/api/subcategories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const subcategory = await storage.getSubcategory(id);
      if (!subcategory) {
        return res.status(404).json({ error: "Subcategory not found" });
      }
      res.json(subcategory);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subcategory" });
    }
  });
  app2.post("/api/subcategories", async (req, res) => {
    try {
      const validation = insertSubcategorySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid subcategory data", details: validation.error });
      }
      const subcategory = await storage.createSubcategory(validation.data);
      res.status(201).json(subcategory);
    } catch (error) {
      res.status(500).json({ error: "Failed to create subcategory" });
    }
  });
  app2.put("/api/subcategories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validation = insertSubcategorySchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid subcategory data", details: validation.error });
      }
      const subcategory = await storage.updateSubcategory(id, validation.data);
      if (!subcategory) {
        return res.status(404).json({ error: "Subcategory not found" });
      }
      res.json(subcategory);
    } catch (error) {
      res.status(500).json({ error: "Failed to update subcategory" });
    }
  });
  app2.delete("/api/subcategories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSubcategory(id);
      if (!deleted) {
        return res.status(404).json({ error: "Subcategory not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete subcategory" });
    }
  });
  app2.get("/api/expenses", async (req, res) => {
    try {
      const { userId, categoryId } = req.query;
      let expenses2;
      if (userId) {
        expenses2 = await storage.getExpensesByUser(userId);
      } else if (categoryId) {
        expenses2 = await storage.getExpensesByCategory(categoryId);
      } else {
        expenses2 = await storage.getAllExpenses();
      }
      res.json(expenses2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });
  app2.get("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const expense = await storage.getExpense(id);
      if (!expense) {
        return res.status(404).json({ error: "Expense not found" });
      }
      res.json(expense);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expense" });
    }
  });
  app2.post("/api/expenses", async (req, res) => {
    try {
      const validation = insertExpenseSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid expense data", details: validation.error });
      }
      const expense = await storage.createExpense(validation.data);
      res.status(201).json(expense);
    } catch (error) {
      res.status(500).json({ error: "Failed to create expense" });
    }
  });
  app2.put("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validation = insertExpenseSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid expense data", details: validation.error });
      }
      const expense = await storage.updateExpense(id, validation.data);
      if (!expense) {
        return res.status(404).json({ error: "Expense not found" });
      }
      res.json(expense);
    } catch (error) {
      res.status(500).json({ error: "Failed to update expense" });
    }
  });
  app2.delete("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteExpense(id);
      if (!deleted) {
        return res.status(404).json({ error: "Expense not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete expense" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
