// backend/seed-handbook-products.js
// Run: node seed-handbook-products.js
import pool from "./db.js";

function autoImage(seed, w = 800, h = 600) {
  return `https://picsum.photos/seed/abuad-${encodeURIComponent(seed)}/${w}/${h}`;
}

const products = [
  // Moringa family
  { name: "Moringa Leaves Powder", description: "High-grade moringa leaf powder from ABUAD Farm", price: 1500.0, category: "Moringa", featured: true },
  { name: "Moringa Capsules", description: "Moringa leaf capsules, nutrient-rich dietary supplement", price: 3000.0, category: "Moringa", featured: true },
  { name: "Moringa Oil (Ben oil)", description: "Cold-pressed moringa (ben) oil", price: 2500.0, category: "Moringa", featured: false },
  { name: "Moringa Seeds", description: "Raw moringa seeds for planting or processing", price: 800.0, category: "Moringa", featured: false },
  { name: "Moringa Tea", description: "Moringa leaf tea bags / loose-leaf", price: 900.0, category: "Moringa", featured: false },

  // Staples / grains / legumes
  { name: "Maize (10kg Bag)", description: "Premium yellow maize (10kg)", price: 7500.0, category: "Grains", featured: true },
  { name: "Rice (25kg Bag)", description: "Locally milled rice (25kg bag)", price: 25000.0, category: "Grains", featured: false },
  { name: "Sorghum (10kg)", description: "Sorghum grain (10kg)", price: 4000.0, category: "Grains", featured: false },
  { name: "Millet (10kg)", description: "Millet grain (10kg)", price: 3800.0, category: "Grains", featured: false },
  { name: "Groundnut (1kg)", description: "Clean groundnut kernels (1kg)", price: 1200.0, category: "Legumes", featured: false },

  // Tubers & cassava products
  { name: "Yam (per tuber)", description: "Fresh yam tuber from ABUAD farm", price: 1200.0, category: "Tubers", featured: false },
  { name: "Garri (5kg)", description: "Garri (5kg) processed from cassava", price: 2800.0, category: "Tubers", featured: false },
  { name: "Cassava Chips (500g)", description: "Cassava chips, ready snack (500g)", price: 600.0, category: "Tubers", featured: false },

  // Vegetables & spices
  { name: "Tomato (1kg)", description: "Fresh tomatoes (1kg)", price: 800.0, category: "Vegetables", featured: true },
  { name: "Red Pepper (2kg)", description: "Dried / fresh red pepper (2kg)", price: 2500.0, category: "Spices", featured: false },
  { name: "Sweet Pepper (1kg)", description: "Sweet bell pepper (1kg)", price: 1200.0, category: "Vegetables", featured: false },

  // Fruits
  { name: "Pawpaw / Papaya (1kg)", description: "Fresh pawpaw (papaya) (1kg)", price: 700.0, category: "Fruits", featured: false },
  { name: "Mango (1kg)", description: "Fresh mango, assorted varieties (1kg)", price: 1000.0, category: "Fruits", featured: true },
  { name: "Sweet Orange (1kg)", description: "Fresh oranges (1kg)", price: 900.0, category: "Fruits", featured: false },
  { name: "Grapefruit (1kg)", description: "Fresh grapefruit (1kg)", price: 1200.0, category: "Fruits", featured: false },
  { name: "Lemon (1kg)", description: "Fresh lemons (1kg)", price: 800.0, category: "Fruits", featured: false },
  { name: "Lime (1kg)", description: "Fresh lime (1kg)", price: 700.0, category: "Fruits", featured: false },

  // Oils, honey & processing products
  { name: "Palm Oil (1L)", description: "Refined palm oil (1L)", price: 1500.0, category: "Oils", featured: false },
  { name: "Raw Honey (1L)", description: "Raw, unprocessed honey (1L) from ABUAD apiary", price: 6000.0, category: "Honey", featured: true },
  { name: "Mango Puree (pack)", description: "Processed mango puree - ABUAD processing", price: 1800.0, category: "Processed", featured: false },
  { name: "Bottled Fruit Juice (pack)", description: "Assorted bottled juice, ABUAD processing unit", price: 1000.0, category: "Processed", featured: false },

  // Mushrooms
  { name: "Oyster Mushroom (pack)", description: "Fresh oyster mushroom pack", price: 1200.0, category: "Mushroom", featured: true },
  { name: "Button Mushroom (pack)", description: "Fresh button mushrooms", price: 1200.0, category: "Mushroom", featured: false },

  // Poultry / livestock / eggs / game
  { name: "Eggs (12pcs)", description: "Farm fresh eggs (12pcs)", price: 800.0, category: "Poultry", featured: true },
  { name: "Broiler Chicken (Dressed 1.5kg)", description: "Dressed broiler chicken (~1.5kg)", price: 4200.0, category: "Poultry", featured: true },
  { name: "Turkey (Dressed 4kg)", description: "Dressed turkey (~4kg)", price: 17000.0, category: "Poultry", featured: false },
  { name: "Duck (per bird)", description: "Duck raised on ABUAD farm (per bird)", price: 2500.0, category: "Poultry", featured: false },
  { name: "Quail Eggs (dozen)", description: "Quail eggs (dozen)", price: 600.0, category: "Poultry", featured: false },
  { name: "Guinea Fowl (per bird)", description: "Guinea fowl (per bird)", price: 4000.0, category: "Poultry", featured: false },

  // Pork & snails
  { name: "Pork (1kg)", description: "Fresh pork cuts (1kg)", price: 4500.0, category: "Meat", featured: false },
  { name: "Snail Meat (1kg)", description: "Snail meat (1kg) from ABUAD snailery", price: 3000.0, category: "Snails", featured: false },

  // Fish
  { name: "Catfish (per kg)", description: "Fresh catfish (per kg)", price: 1200.0, category: "Fish", featured: true },
  { name: "Tilapia (per kg)", description: "Fresh tilapia (per kg)", price: 1000.0, category: "Fish", featured: false }
];

async function upsertProducts() {
  const client = await pool.connect();
  try {
    console.log("Seeding handbook products...");
    await client.query("BEGIN");

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const image_url = autoImage(p.name.replace(/\s+/g, "-").toLowerCase(), 800, 600);
      // check by name
      const existing = await client.query("SELECT id FROM products WHERE name = $1 LIMIT 1", [p.name]);
      if (existing.rows.length > 0) {
        await client.query(
          `UPDATE products SET description = $1, price = $2, category = $3, featured = $4, image_url = $5 WHERE id = $6`,
          [p.description, p.price, p.category, p.featured, image_url, existing.rows[0].id]
        );
      } else {
        await client.query(
          `INSERT INTO products (name, description, price, category, featured, image_url) VALUES ($1,$2,$3,$4,$5,$6)`,
          [p.name, p.description, p.price, p.category, p.featured, image_url]
        );
      }
    }

    await client.query("COMMIT");
    console.log("✅ Handbook products seeded / updated:", products.length);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seeder failed:", err);
  } finally {
    client.release();
    process.exit(0);
  }
}

upsertProducts();