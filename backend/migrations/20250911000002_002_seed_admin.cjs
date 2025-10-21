// backend/migrations/002_seed_admin.js
exports.up = async (pgm) => {
  const bcrypt = require("bcryptjs");
  const hashed = await bcrypt.hash("password", 10);

  pgm.sql(`
    INSERT INTO users (name, email, password, role, created_at)
    SELECT 'Admin', 'admin@example.com', '${hashed}', 'admin', now()
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@example.com');
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DELETE FROM users WHERE email = 'admin@example.com';`);
};