// backend/migrations/20250911000003_003_seed_test_user.cjs
exports.up = async (pgm) => {
  const bcrypt = require("bcryptjs");
  const hashed = await bcrypt.hash("secret123", 10);

  pgm.sql(`
    INSERT INTO users (name, email, password, role, created_at)
    SELECT 'Test User', 'test@example.com', '${hashed}', 'user', now()
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'test@example.com');
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DELETE FROM users WHERE email = 'test@example.com';`);
};