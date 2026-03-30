import os
import psycopg2
import json

# Connection string
DATABASE_URL = "postgresql://neondb_owner:npg_mB8dwyRkq9DA@ep-winter-lake-amrksupt.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"

def sync_images():
    print("🔍 Connecting to Neon Database...")
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return

    # 1. Get local files
    upload_dir = os.path.join(os.getcwd(), 'uploads')
    if not os.path.exists(upload_dir):
        print(f"❌ Upload directory not found: {upload_dir}")
        return
        
    available_files = [f for f in os.listdir(upload_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    print(f"🔍 Found {len(available_files)} images in backend/uploads.")

    if not available_files:
        print("❌ No images to sync.")
        return

    # 2. Get products
    cur.execute("SELECT id, name, images FROM products ORDER BY id ASC")
    products = cur.fetchall()
    print(f"📦 Checking {len(products)} products.")

    updated_count = 0
    for i, p in enumerate(products):
        p_id, p_name, p_images = p
        
        # p_images is already parsed as a list by psycopg2 if it's JSONB
        broken = False
        if not p_images:
            broken = True
        else:
            for img in p_images:
                filename = os.path.basename(img)
                if filename not in available_files:
                    broken = True
                    break
        
        if broken:
            # Map to one of the 51 images
            replacement = f"/uploads/{available_files[i % len(available_files)]}"
            print(f"♻️  Repairing [{p_name}]: Replacing with {replacement}")
            
            # Update as JSONB
            replacement_json = json.dumps([replacement])
            cur.execute("UPDATE products SET images = %s::jsonb WHERE id = %s", (replacement_json, p_id))
            updated_count += 1

    conn.commit()
    print(f"\n🎉 Repair finished! {updated_count} products updated.")
    cur.close()
    conn.close()

if __name__ == "__main__":
    sync_images()
