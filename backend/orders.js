// orders.js
const express = require("express");
const router = express.Router();
const pool = require("./db"); // adjust path to your db/pool module
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware"); // adjust path if needed

// POST /api/orders - Create new order (public)
router.post("/orders", async (req, res) => {
  const client = await pool.connect();
  try {
    const { customer, items, total } = req.body;

    // Validation
    if (!customer || !items || !total) {
      return res.status(400).json({ success: false, error: "Missing order data" });
    }

    if (!customer.name || !customer.email || !customer.phone || !customer.address) {
      return res.status(400).json({ success: false, error: "Missing customer info" });
    }

    // Generate order number
    const orderNumber = "ABUAD-" + Date.now() + "-" + Math.floor(Math.random() * 1000);

    await client.query("BEGIN");

    // Insert main order
    const orderResult = await client.query(
      `INSERT INTO orders (order_number, customer_name, email, phone, address, total)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, order_number, created_at, email, customer_name`,
      [orderNumber, customer.name, customer.email, customer.phone, customer.address, total]
    );

    const orderId = orderResult.rows[0].id;

    // Insert order items
    for (let item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.id || item.product_id, item.quantity, item.price]
      );
    }

    await client.query("COMMIT");

    console.log(`✅ Order created: ${orderNumber}`);

    res.json({
      success: true,
      order_number: orderResult.rows[0].order_number,
      created_at: orderResult.rows[0].created_at,
      order_id: orderId,
      email: orderResult.rows[0].email,
      customer_name: orderResult.rows[0].customer_name,
    });
  } catch (error) {
    try { await client.query("ROLLBACK"); } catch (e) { /* ignore */ }
    console.error("❌ Order creation failed:", error);
    res.status(500).json({ success: false, error: "Failed to create order" });
  } finally {
    client.release();
  }
});

// GET /api/orders - List all orders (admin only)
router.get("/orders", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*,
             COALESCE(counts.item_count, 0) AS item_count
      FROM orders o
      LEFT JOIN (
        SELECT order_id, COUNT(*) AS item_count
        FROM order_items
        GROUP BY order_id
      ) counts ON counts.order_id = o.id
      ORDER BY o.created_at DESC
    `);

    res.json({ success: true, orders: result.rows });
  } catch (error) {
    console.error("❌ Failed to fetch orders:", error);
    res.status(500).json({ success: false, error: "Failed to fetch orders" });
  }
});

// GET /api/orders/:id - Get single order (admin or order owner)
router.get("/orders/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;
  try {
    // Fetch order
    const orderResult = await pool.query(`SELECT * FROM orders WHERE id = $1 OR order_number = $1`, [id]);
    if (!orderResult.rows.length) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }
    const order = orderResult.rows[0];

    // Authorization: allow admin OR owner (by email)
    if (req.user.role !== "admin") {
      // If user token doesn't include email, block
      if (!req.user.email || req.user.email !== order.email) {
        return res.status(403).json({ success: false, error: "Forbidden" });
      }
    }

    // Fetch items
    const itemsResult = await pool.query(
      `SELECT oi.*, p.name as product_name
       FROM order_items oi
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = $1`,
      [order.id]
    );

    order.items = itemsResult.rows;

    res.json({ success: true, order });
  } catch (error) {
    console.error("❌ Failed to fetch order details:", error);
    res.status(500).json({ success: false, error: "Failed to fetch order details" });
  }
});

// PUT /api/orders/:id - Update order (admin only; used for status changes)
router.put("/orders/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, error: "Missing status" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const updateResult = await client.query(
      `UPDATE orders SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (!updateResult.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    const updatedOrder = updateResult.rows[0];

    await client.query("COMMIT");

    // Optionally return items as well
    const itemsResult = await pool.query(
      `SELECT oi.*, p.name as product_name
       FROM order_items oi
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = $1`,
      [updatedOrder.id]
    );

    updatedOrder.items = itemsResult.rows;

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    try { await client.query("ROLLBACK"); } catch (e) { /* ignore */ }
    console.error("❌ Failed to update order:", error);
    res.status(500).json({ success: false, error: "Failed to update order" });
  } finally {
    client.release();
  }
});

module.exports = router;