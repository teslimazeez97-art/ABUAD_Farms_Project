// backend/migrations/001_create_tables.js
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("users", {
    id: { type: "serial", primaryKey: true },
    name: { type: "text", notNull: true },
    email: { type: "text", notNull: true, unique: true },
    password: { type: "text", notNull: true },
    role: { type: "text", notNull: true, default: "customer" },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("current_timestamp") }
  });

  pgm.createTable("products", {
    id: { type: "serial", primaryKey: true },
    name: { type: "text", notNull: true },
    description: { type: "text", notNull: false },
    price: { type: "numeric(10,2)", notNull: true, default: 0 },
    category: { type: "text", notNull: false },
    featured: { type: "boolean", notNull: true, default: false },
    image_url: { type: "text", notNull: false },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("current_timestamp") }
  });

  pgm.createTable("orders", {
    id: { type: "serial", primaryKey: true },
    order_number: { type: "text", notNull: true, unique: true },
    customer_name: { type: "text", notNull: true },
    email: { type: "text", notNull: true },
    phone: { type: "text", notNull: true },
    address: { type: "text", notNull: true },
    total: { type: "numeric(12,2)", notNull: true },
    user_id: { type: "integer", references: "users", onDelete: "SET NULL" },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("current_timestamp") }
  });

  pgm.createTable("order_items", {
    id: { type: "serial", primaryKey: true },
    order_id: { type: "integer", notNull: true, references: "orders", onDelete: "CASCADE" },
    product_id: { type: "integer", notNull: true, references: "products", onDelete: "RESTRICT" },
    quantity: { type: "integer", notNull: true, default: 1 },
    price: { type: "numeric(10,2)", notNull: true }
  });

  pgm.createIndex("products", "category");
  pgm.createIndex("orders", "user_id");
};

exports.down = (pgm) => {
  pgm.dropTable("order_items");
  pgm.dropTable("orders");
  pgm.dropTable("products");
  pgm.dropTable("users");
};