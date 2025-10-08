const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'build');
const indexPath = path.join(buildDir, 'index.html');
const fallbackPath = path.join(buildDir, '200.html');

if (!fs.existsSync(indexPath)) {
  console.error('index.html not found in build directory. Run build first.');
  process.exit(1);
}

fs.copyFileSync(indexPath, fallbackPath);
console.log('Created 200.html fallback for SPA routing.');
