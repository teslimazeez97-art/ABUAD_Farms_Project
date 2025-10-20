// backend/check-users.js
// Run: node check-users.js
import pool from "./db.js";

async function checkUsers() {
  try {
    const result = await pool.query(`
      SELECT id, name, email, role, created_at
      FROM users
      ORDER BY created_at
    `);

    console.log("Users in database:");
    result.rows.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error checking users:", error);
    process.exit(1);
  }
}

checkUsers();