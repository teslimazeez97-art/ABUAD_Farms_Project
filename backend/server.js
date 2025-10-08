import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "./db.js";
import multer from "multer";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 5001; // ✅ FIXED: Changed to 5001

// Ensure uploads directory exists
const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ============================
// MIDDLEWARE
// ============================
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3003',
    'https://abuad-farms-project.vercel.app',
    'https://abuad-farms-project-*.vercel.app',
    'https://abuad-farms-project.onrender.com'
  ],
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));

// Serve uploaded files
app.use("/uploads", express.static(UPLOAD_DIR));

// Auth middleware
function authMiddleware(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecret");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
}

// Admin middleware
function adminMiddleware(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admins only" });
  }
  next();
}

// ============================
// DATABASE CONNECTION TEST
// ============================
try {
  const client = await pool.connect();
  console.log("✅ Database connected successfully");
  client.release();
} catch (err) {
  console.error("❌ Database connection failed:", err?.message || err);
}

// ============================
// MULTER (file upload) SETUP
// ============================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    // sanitize filename minimally
    const safeName = file.originalname.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-_.]/g, "");
    cb(null, `${Date.now()}-${safeName}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only jpg/png/webp images are allowed"));
    }
    cb(null, true);
  },
});

// ============================
// HEALTH CHECK
// ============================
app.get("/", (req, res) => {
  res.json({ message: "ABUAD Farms API is running!" });
});

// ============================
// AUTHENTICATION ROUTES
// ============================

// Register new user
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if email exists
    const existing = await pool.query("SELECT * FROM users WHERE email = \$1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES (\$1, \$2, \$3, \$4)
       RETURNING id, name, email, role`,
      [name, email, hashedPassword, role || "customer"]
    );

    const newUser = result.rows[0];

    // Create token for auto-login
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || "supersecret",
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      user: newUser,
    });
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// Login user
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Find user
    const result = await pool.query("SELECT * FROM users WHERE email = \$1", [email]);
    const user = result.rows[0];

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    // Check password
    const match = bcrypt.compareSync(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    // Create token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "supersecret",
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: "Failed to login" });
  }
});

// ============================
// PRODUCTS ROUTES (FIXED COLUMN NAMES)
// ============================

// GET /api/products
app.get("/api/products", async (req, res) => {
  console.log('📊 API: Fetching products...');
  try {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      sort = "latest",
      page = 1,
      limit = 24,
    } = req.query;

    const where = [];
    const params = [];
    let idx = 1;

    if (q) {
      where.push(`(name ILIKE $${idx} OR description ILIKE $${idx})`);
      params.push(`%${q}%`);
      idx++;
    }

    if (category) {
      if (category === "others") {
        where.push(`(category IS NULL OR category = '')`);
      } else {
        where.push(`category = $${idx}`);
        params.push(category);
        idx++;
      }
    }

    if (minPrice) {
      where.push(`price >= $${idx}`);
      params.push(minPrice);
      idx++;
    }
    if (maxPrice) {
      where.push(`price <= $${idx}`);
      params.push(maxPrice);
      idx++;
    }

    const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";

    let orderSQL = "ORDER BY id DESC";
    if (sort === "price_asc") orderSQL = "ORDER BY price ASC";
    if (sort === "price_desc") orderSQL = "ORDER BY price DESC";

    const offset = (Math.max(parseInt(page, 10), 1) - 1) * parseInt(limit, 10);

    const sql = `SELECT * FROM products ${whereSQL} ${orderSQL} LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(limit, offset);

    const result = await pool.query(sql, params);
    console.log('✅ API: Fetched', result.rows.length, 'products');
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /api/products/featured - ✅ FIXED: Use featured column
app.get("/api/products/featured", async (req, res) => {
  console.log('⭐ API: Fetching featured products...');
  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE featured = true ORDER BY id DESC LIMIT 5"
    );
    console.log('✅ API: Fetched', result.rows.length, 'featured products');
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching featured products:", error);
    res.status(500).json({ error: "Failed to fetch featured products" });
  }
});

// GET /api/products/:id
app.get("/api/products/:id", async (req, res) => {
  console.log('🔍 API: Fetching product:', req.params.id);
  try {
    const result = await pool.query("SELECT * FROM products WHERE id = \$1", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    console.log('✅ API: Found product:', result.rows[0].name);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// ✅ FIXED: Admin routes with correct column names
// Create product (NO AUTH REQUIRED FOR TESTING - REMOVE LATER)
app.post("/api/products", async (req, res) => {
  console.log('➕ API: Adding new product:', req.body.name);
  try {
    const { name, description, price, category, stock_quantity, is_featured, image_url } = req.body;
    
    if (!name || price == null) {
      return res.status(400).json({ error: "Product name and price are required" });
    }

    const result = await pool.query(
      `INSERT INTO products (name, description, price, category, stock_quantity, is_featured, image_url, created_at, updated_at) 
       VALUES (\$1, \$2, \$3, \$4, \$5, \$6, \$7, NOW(), NOW()) 
       RETURNING *`,
      [
        name, 
        description || "", 
        parseFloat(price), 
        category || null, 
        parseInt(stock_quantity) || 0, 
        !!is_featured, 
        image_url || null
      ]
    );
    
    console.log('✅ API: Product added with ID:', result.rows[0].id);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ API: Add product error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update product (NO AUTH REQUIRED FOR TESTING - REMOVE LATER)
app.put("/api/products/:id", async (req, res) => {
  console.log('📝 API: Updating product:', req.params.id);
  try {
    const { id } = req.params;
    const { name, description, price, category, stock_quantity, is_featured, image_url } = req.body;
    
    const result = await pool.query(
      `UPDATE products 
       SET name = \$1, description = \$2, price = \$3, category = \$4, 
           stock_quantity = \$5, is_featured = \$6, image_url = \$7, updated_at = NOW()
       WHERE id = \$8 
       RETURNING *`,
      [name, description, parseFloat(price), category, parseInt(stock_quantity) || 0, !!is_featured, image_url, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    console.log('✅ API: Product updated successfully');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ API: Update product error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete product (NO AUTH REQUIRED FOR TESTING - REMOVE LATER)
app.delete("/api/products/:id", async (req, res) => {
  console.log('🗑️ API: Deleting product:', req.params.id);
  try {
    const { id } = req.params;
    
    // Check if product exists in any orders
    const orderCheck = await pool.query('SELECT COUNT(*) as count FROM order_items WHERE product_id = $1', [id]);
    if (orderCheck.rows[0].count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete product that has been ordered. This product appears in existing orders.' 
      });
    }
    
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    console.log('✅ API: Product deleted successfully');
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('❌ API: Delete product error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================
// CATEGORIES ROUTES
// ============================

// GET /api/categories
app.get("/api/categories", async (req, res) => {
  console.log('🏷️ API: Fetching categories...');
  try {
    const counts = req.query.counts === "true" || req.query.counts === "1";

    if (counts) {
      const q = `
        SELECT COALESCE(NULLIF(trim(category), ''), 'Others') AS category,
               COUNT(*)::int AS count
        FROM products
        GROUP BY COALESCE(NULLIF(trim(category), ''), 'Others')
        ORDER BY CASE WHEN COALESCE(NULLIF(trim(category), ''), 'Others') = 'Others' THEN 0 ELSE 1 END, category;
      `;
      const result = await pool.query(q);
      console.log('✅ API: Fetched categories with counts:', result.rows.length);
      return res.json(result.rows.map((r) => ({ category: r.category, count: r.count })));
    } else {
      const q = `
        SELECT DISTINCT COALESCE(NULLIF(trim(category), ''), 'Others') AS category,
               CASE WHEN COALESCE(NULLIF(trim(category), ''), 'Others') = 'Others' THEN 0 ELSE 1 END AS sort_order
        FROM products
        ORDER BY CASE WHEN COALESCE(NULLIF(trim(category), ''), 'Others') = 'Others' THEN 0 ELSE 1 END, category;
      `;
      const result = await pool.query(q);
      const categories = result.rows.map((r) => r.category);

      if (!categories.includes("Others")) categories.unshift("Others");
      console.log('✅ API: Fetched categories:', categories);
      return res.json(categories);
    }
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    return res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// PUT /api/categories (ADMIN ONLY)
app.put("/api/categories", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { oldName, newName } = req.body;
    if (!oldName || !newName) {
      return res.status(400).json({ error: "oldName and newName are required" });
    }

    const setVal = newName === "Others" ? null : newName;

    let result;
    if (oldName === "Others") {
      result = await pool.query(
        `UPDATE products SET category = \$1 WHERE category IS NULL OR trim(category) = ''`,
        [setVal]
      );
    } else {
      result = await pool.query(
        `UPDATE products SET category = \$1 WHERE category = \$2`,
        [setVal, oldName]
      );
    }

    res.json({ success: true, updated: result.rowCount });
  } catch (error) {
    console.error("❌ Error renaming category:", error);
    res.status(500).json({ error: "Failed to rename category" });
  }
});

// DELETE /api/categories (ADMIN ONLY)
app.delete("/api/categories", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { category } = req.body;
    if (!category) {
      return res.status(400).json({ error: "category is required" });
    }

    if (category === "Others") {
      return res.status(400).json({ error: "Cannot delete 'Others' category" });
    }

    const result = await pool.query(`UPDATE products SET category = NULL WHERE category = \$1`, [category]);
    res.json({ success: true, updated: result.rowCount });
  } catch (error) {
    console.error("❌ Error deleting category:", error);
    res.status(500).json({ error: "Failed to delete category" });
  }
});

// POST /api/products/upload (ADMIN only)
app.post(
  "/api/products/upload",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const base = process.env.SERVER_URL || `${req.protocol}://${req.get("host")}`;
      const url = `${base}/uploads/${encodeURIComponent(req.file.filename)}`;

      res.json({ url });
    } catch (err) {
      console.error("❌ Upload error:", err);
      res.status(500).json({ error: "Failed to upload image" });
    }
  }
);

// ============================
// ORDERS ROUTES
// ============================

// Create order (NO AUTH REQUIRED - for guest checkout)
app.post('/api/orders', async (req, res) => {
  try {
    console.log('📦 Received order:', req.body);
    
    const { customer, items, total } = req.body;
    
    if (!customer || !items || total == null) {
      return res.status(400).json({ success: false, error: "Invalid order data" });
    }

    const { name, email, phone, address } = customer;
    if (!name || !email || !phone || !address) {
      return res.status(400).json({ success: false, error: "Incomplete customer info" });
    }

    // Generate order number
    const orderNumber = `ABUAD-${Date.now()}`;
    
    // Insert order into database
    const orderResult = await pool.query(
      `INSERT INTO orders (order_number, customer_name, customer_email, customer_phone, 
       delivery_address, total_amount, status, created_at) 
       VALUES (\$1, \$2, \$3, \$4, \$5, \$6, \$7, NOW()) RETURNING *`,
      [orderNumber, customer.name, customer.email, customer.phone, 
       customer.address, total, 'pending']
    );
    
    const order = orderResult.rows[0];
    console.log('✅ Order created:', order);
    
    // Insert order items
    for (const item of items) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, price) 
         VALUES (\$1, \$2, \$3, \$4, \$5)`,
        [order.id, item.id, item.name, item.quantity, item.price]
      );
    }
    
    console.log('🎉 Order completed successfully');
    
    res.json({
      success: true,
      message: 'Order placed successfully',
      order_number: orderNumber,
      order_id: order.id,
      created_at: order.created_at,
      total: total
    });
    
  } catch (error) {
    console.error('❌ Order creation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create order: ' + error.message 
    });
  }
});

// Get orders (TEMPORARILY NO AUTH FOR TESTING)
app.get("/api/orders", async (req, res) => {
  try {
    let query = `
      SELECT o.*, COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
    `;
    let params = [];

    // TEMPORARILY RETURN ALL ORDERS FOR TESTING
    query += ` GROUP BY o.id ORDER BY o.created_at DESC`;

    const result = await pool.query(query, params);
    res.json({ success: true, orders: result.rows });
  } catch (err) {
    console.error("❌ Failed to fetch orders:", err);
    res.status(500).json({ success: false, error: "Failed to fetch orders" });
  }
});

// Get single order (AUTHENTICATED USERS)
app.get("/api/orders/:order_number", authMiddleware, async (req, res) => {
  try {
    const { order_number } = req.params;

    let orderQuery = `SELECT * FROM orders WHERE order_number = \$1`;
    let orderParams = [order_number];

    // Non-admin users can only see their own orders
    if (req.user.role !== "admin") {
      orderQuery += ` AND user_id = \$2`;
      orderParams.push(req.user.id);
    }

    const orderRes = await pool.query(orderQuery, orderParams);

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    const order = orderRes.rows[0];

    // Get order items
    const itemsRes = await pool.query(
      `SELECT oi.*, p.name 
       FROM order_items oi
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = \$1
       ORDER BY oi.id`,
      [order.id]
    );

    res.json({ success: true, order, items: itemsRes.rows });
  } catch (err) {
    console.error("❌ Failed to fetch order:", err);
    res.status(500).json({ success: false, error: "Failed to fetch order" });
  }
});
// PUT /api/orders/:id — Update order status
app.put('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Status is required' });
  }

  // Optional: verify token (if you have auth middleware, use that instead)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Example using raw SQL with pg (replace with your DB client if different)
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order: result.rows[0] });
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
// ============================
// START SERVER
// ============================
app.listen(PORT, () => {
  console.log(`🚀 ABUAD Farms API running on http://localhost:${PORT}`);
  console.log(`\n📋 Available Endpoints:`);
  console.log(`🏠 GET    /`);
  console.log(`🔐 POST   /api/auth/register`);
  console.log(`🔐 POST   /api/auth/login`);
  console.log(`📊 GET    /api/products`);
  console.log(`⭐ GET    /api/products/featured`);
  console.log(`🔎 GET    /api/products/:id`);
  console.log(`➕ POST   /api/products (NO AUTH - TESTING)`);
  console.log(`📁 POST   /api/products/upload (ADMIN)`);
  console.log(`✏️  PUT    /api/products/:id (NO AUTH - TESTING)`);
  console.log(`🗑️  DELETE /api/products/:id (NO AUTH - TESTING)`);
  console.log(`📦 GET    /api/categories`);
  console.log(`✏️  PUT    /api/categories (ADMIN)`);
  console.log(`🗑️  DELETE /api/categories (ADMIN)`);
  console.log(`🛒 POST   /api/orders (NO AUTH - GUEST CHECKOUT)`);
  console.log(`📦 GET    /api/orders (AUTH)`);
  console.log(`🧾 GET    /api/orders/:order_number (AUTH)`);
});

// ============================
// 404 HANDLER (MUST BE LAST!)
// ============================
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});