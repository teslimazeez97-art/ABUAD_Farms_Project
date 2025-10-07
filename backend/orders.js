const express = require("express");
const router = express.Router();
const pool = require("./db"); // your PostgreSQL pool

// POST /api/orders - Create new order
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
       RETURNING id, order_number, created_at`,
      [orderNumber, customer.name, customer.email, customer.phone, customer.address, total]
    );

    const orderId = orderResult.rows[0].id;

    // Insert order items
    for (let item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.id, item.quantity, item.price]
      );
    }

    await client.query("COMMIT");

    console.log(`✅ Order created: ${orderNumber}`);

    res.json({
      success: true,
      order_number: orderResult.rows[0].order_number,
      created_at: orderResult.rows[0].created_at,
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Order creation failed:", error);
    res.status(500).json({ success: false, error: "Failed to create order" });
  } finally {
    client.release();
  }
});

// GET /api/orders - List all orders (for admin)
router.get("/orders", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, 
             COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);

    res.json({ success: true, orders: result.rows });
  } catch (error) {
    console.error("❌ Failed to fetch orders:", error);
    res.status(500).json({ success: false, error: "Failed to fetch orders" });
  }
});

module.exports = router;