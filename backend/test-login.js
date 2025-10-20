// backend/test-login.js
// Run: node test-login.js
import pool from "./db.js";
import bcrypt from "bcryptjs";

async function testLogin() {
  try {
    const email = "test@example.com";
    const password = "secret123";

    console.log("Testing login for:", email);

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
      console.log("❌ User not found");
      return;
    }

    console.log("User found:", user.name, user.email, user.role);

    const match = bcrypt.compareSync(password, user.password);
    console.log("Password match:", match);

    if (match) {
      console.log("✅ Login should work");
    } else {
      console.log("❌ Password doesn't match");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error testing login:", error);
    process.exit(1);
  }
}

testLogin();