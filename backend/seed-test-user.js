// backend/seed-test-user.js
// Run: node seed-test-user.js
import pool from "./db.js";
import bcrypt from "bcryptjs";

async function seedTestUser() {
  try {
    const hashedPassword = await bcrypt.hash("secret123", 10);

    const result = await pool.query(`
      INSERT INTO users (name, email, password, role, created_at)
      SELECT 'Test User', 'test@example.com', $1, 'user', now()
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'test@example.com')
      RETURNING id, name, email, role
    `, [hashedPassword]);

    if (result.rows.length > 0) {
      console.log("Test user created:", result.rows[0]);
    } else {
      console.log("Test user already exists");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error seeding test user:", error);
    process.exit(1);
  }
}

seedTestUser();