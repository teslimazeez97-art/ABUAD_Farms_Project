/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const up = (pgm) => {
  pgm.sql(`
    INSERT INTO products (name, description, price, category, featured, image_url)
    VALUES
      ('Fresh Tomatoes', 'Organic red tomatoes from our farm', 1200, 'Vegetables', true, 'https://via.placeholder.com/300x200?text=Tomatoes'),
      ('Maize', 'Harvested maize, rich in fiber', 800, 'Grains', false, 'https://via.placeholder.com/300x200?text=Maize'),
      ('Catfish', 'Fresh farmed catfish', 2500, 'Livestock', true, 'https://via.placeholder.com/300x200?text=Catfish'),
      ('Palm Oil', 'Pure red palm oil from local farmers', 1500, 'Oil', false, 'https://via.placeholder.com/300x200?text=Palm+Oil'),
      ('Yam Tubers', 'Fresh yams harvested from the farm', 2000, 'Roots', true, 'https://via.placeholder.com/300x200?text=Yam+Tubers')
    ON CONFLICT DO NOTHING;
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    DELETE FROM products 
    WHERE name IN ('Fresh Tomatoes','Maize','Catfish','Palm Oil','Yam Tubers');
  `);
};
