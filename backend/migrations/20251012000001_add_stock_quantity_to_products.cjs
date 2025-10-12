// backend/migrations/20251012000001_add_stock_quantity_to_products.cjs
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumn("products", "stock_quantity", {
    type: "integer",
    notNull: true,
    default: 0
  });
};

exports.down = (pgm) => {
  pgm.dropColumn("products", "stock_quantity");
};