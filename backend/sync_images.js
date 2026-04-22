const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_mB8dwyRkq9DA@ep-winter-lake-amrksupt.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function syncImages() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  const uploadDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadDir)) {
      console.error("❌ Error: backend/uploads directory not found.");
      process.exit(1);
  }
  
  const availableFiles = fs.readdirSync(uploadDir).filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png'));
  console.log(`🔍 Found ${availableFiles.length} images in backend/uploads.`);

  if (availableFiles.length === 0) {
      console.error("❌ No image files found to sync.");
      process.exit(1);
  }

  const res = await client.query('SELECT id, name, images FROM products ORDER BY id ASC');
  const products = res.rows;
  console.log(`📦 Found ${products.length} products to check.`);

  let updatedCount = 0;
  
  // Strategy: For each product, if their current images are MISSING on disk, 
  // we re-assign them to the available pool of 51 images to fix the 404s.
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const currentImages = p.images || [];
    const validImages = [];
    const brokenFound = currentImages.some(img => !availableFiles.includes(path.basename(img)));

    if (brokenFound || currentImages.length === 0) {
      // Pick a "best fit" or just a rotating index image to replace the broken one.
      const replacementImage = `/uploads/${availableFiles[i % availableFiles.length]}`;
      console.log(`♻️  Repairing [Product ${p.id} - ${p.name}]: Replacing broken links with ${replacementImage}`);
      
      await client.query('UPDATE products SET images = $1 WHERE id = $2', [[replacementImage], p.id]);
      updatedCount++;
    }
  }

  console.log(`\n🎉 Repair finished! ${updatedCount} products updated with valid image paths.`);
  await client.end();
}

syncImages().catch(e => {
    console.error(e);
    process.exit(1);
});
