import pool from './db.js';

async function seedOrders() {
  console.log('🌱 Seeding sample orders...');

  try {
    // First, get some products to create orders with
    const productsResult = await pool.query('SELECT id, name, price FROM products LIMIT 5');
    const products = productsResult.rows;

    if (products.length === 0) {
      console.log('❌ No products found. Please seed products first.');
      return;
    }

    // Sample customer data
    const customers = [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+2348012345678',
        address: '123 Main Street, Lagos, Nigeria'
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+2348098765432',
        address: '456 Oak Avenue, Abuja, Nigeria'
      },
      {
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
        phone: '+2348076543210',
        address: '789 Pine Road, Port Harcourt, Nigeria'
      }
    ];

    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        // Generate order number
        const orderNumber = `ABUAD-${Date.now()}-${i + 1}`;

        // Select 2-3 random products for this order
        const orderProducts = products
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.floor(Math.random() * 3) + 2);

        // Calculate total
        let total = 0;
        const orderItems = orderProducts.map(product => {
          const quantity = Math.floor(Math.random() * 3) + 1;
          const itemTotal = quantity * parseFloat(product.price);
          total += itemTotal;
          return {
            product_id: product.id,
            quantity: quantity,
            price: parseFloat(product.price)
          };
        });

        // Insert order
        const orderResult = await client.query(
          `INSERT INTO orders (customer_name, customer_email, total_amount, status, created_at)
           VALUES ($1, $2, $3, $4, NOW() - INTERVAL '${Math.floor(Math.random() * 30)} days')
           RETURNING id`,
          [customer.name, customer.email, total, 'pending']
        );

        const orderId = orderResult.rows[0].id;

        // Insert order items
        for (const item of orderItems) {
          await client.query(
            `INSERT INTO order_items (order_id, product_id, quantity, price)
             VALUES ($1, $2, $3, $4)`,
            [orderId, item.product_id, item.quantity, item.price]
          );
        }

        await client.query('COMMIT');
        console.log(`✅ Created order ${orderNumber} for ${customer.name}`);

      } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error creating order:', error);
      } finally {
        client.release();
      }
    }

    console.log('🎉 Sample orders seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding orders:', error);
  } finally {
    process.exit(0);
  }
}

seedOrders();