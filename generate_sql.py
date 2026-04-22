import json

products = [
    {
        "id": 17,
        "name": "Zrir Classique",
        "type": "Zrir",
        "description": "Un mélange harmonieux de sésame, amande et noisette, sublimé par du beurre, de l'huile d'olive et du miel de jujubier. Une recette riche et équilibrée au goût authentique.",
        "ingredients": ["sésame", "noisette", "amande", "beurre", "huile d'olive", "miel de jujubier"],
        "variants": [{"size": "250g", "price": 17}, {"size": "500g", "price": 30}, {"size": "1kg", "price": 60}],
        "images": ["/uploads/18d574a7-1488-477e-aee2-77a50d9a1401.jpeg", "/uploads/1a8e81e4-9059-48d9-b2f1-56298e022ed0.jpg", "/uploads/dd2eab26-54ea-43df-84e3-d32ff5619d64.jpg"],
        "main_image_index": 0
    },
    {
        "id": 18,
        "name": "Zrir Noisette",
        "type": "Zrir",
        "description": "Une version gourmande à base de noisettes et sésame, associée au beurre, à l'huile d'olive et au miel de jujubier pour une texture fondante et un goût intense.",
        "ingredients": ["sésame", "noisette", "beurre", "huile d'olive", "miel de jujubier"],
        "variants": [{"size": "250g", "price": 28}, {"size": "500g", "price": 50}, {"size": "1kg", "price": 100}],
        "images": ["/uploads/ba5f9499-4faa-412a-b48b-94a046505a8c.jpg", "/uploads/0ce11c74-0ec7-4782-8dcd-9ce52651135e.jpg", "/uploads/e9fce728-d69d-4d37-817e-c8884a964a57.jpg", "/uploads/f7e13990-e4a1-42cf-a614-967b0501b5f6.jpg"],
        "main_image_index": 0
    },
    {
        "id": 19,
        "name": "Zrir Pistache",
        "type": "Zrir",
        "description": "Un délice raffiné composé de pistache et amande, enrichi de beurre, d'huile d'olive et de miel de jujubier. Parfait pour les amateurs de saveurs fines.",
        "ingredients": ["pistache", "amande", "beurre", "huile d'olive", "miel de jujubier"],
        "variants": [{"size": "250g", "price": 40}, {"size": "500g", "price": 70}, {"size": "1kg", "price": 140}],
        "images": ["/uploads/8166f01a-b1d2-4600-9be2-81beb0f9c810.jpg", "/uploads/c3c1a933-7d1e-445c-970f-73aac63f510e.jpg", "/uploads/aaefc1de-aa32-4175-bae9-b53e89c4c356.jpg"],
        "main_image_index": 0
    },
    {
        "id": 20,
        "name": "Zrir Noix",
        "type": "Zrir",
        "description": "Une recette riche en noix et sésame, accompagnée de beurre, d'huile d'olive et de miel de jujubier. Une source naturelle d'énergie et de bienfaits.",
        "ingredients": ["noix", "sésame", "beurre", "huile d'olive", "miel de jujubier"],
        "variants": [{"size": "250g", "price": 23}, {"size": "500g", "price": 40}, {"size": "1kg", "price": 80}],
        "images": ["/uploads/c275d77e-4740-4c14-8e1c-5dddcc8d424c.jpg", "/uploads/f4148a60-d342-4bda-82c5-611311ecdd52.jpg", "/uploads/6ffdfe9a-2b5b-4378-a6aa-0d47fccc6163.jpg"],
        "main_image_index": 0
    },
    {
        "id": 24,
        "name": "Bsissa Noisette",
        "type": "Bsissa",
        "description": "Savourez l'alliance gourmande du blé et de la noisette dans cette bsissa artisanale. Enrichie d'huile d'olive et de miel de jujubier, elle se distingue par sa douceur et son arôme légèrement grillé. Une option nutritive et savoureuse pour bien démarrer la journée.",
        "ingredients": ["blé", "noisette", "huile d'olive", "miel de jujubier"],
        "variants": [{"size": "250g", "price": 20}, {"size": "500g", "price": 35}, {"size": "1kg", "price": 70}],
        "images": ["/uploads/ff557a80-ffd0-467b-9028-1946877db657.jpeg", "/uploads/56c9cabc-65f5-4aff-9945-a3fbdbb8d421.jpg", "/uploads/20bed33d-989d-4d06-b9dd-d6317a6a87fb.jpg"],
        "main_image_index": 0
    },
    {
        "id": 21,
        "name": "Zrir Royal",
        "type": "Zrir",
        "description": "La version la plus luxueuse : noisette, sésame, amande, cajou, noix, pignon et pistache, mélangés avec du beurre, de l'huile d'olive et du miel de jujubier. Un concentré de richesse et de saveurs.",
        "ingredients": ["noisette", "sésame", "amande", "cajou", "noix", "pignon", "pistache", "beurre", "huile d'olive"],
        "variants": [{"size": "250g", "price": 40}, {"size": "500g", "price": 70}, {"size": "1kg", "price": 140}],
        "images": ["/uploads/03cc9800-00ef-457d-ac8e-790acd4faba8.jpg", "/uploads/f3a4e8e3-018f-4cfb-9c7f-75d5ac3382d0.jpg", "/uploads/bc6d02ce-903c-4214-ad1e-70b947661c11.jpg"],
        "main_image_index": 0
    },
    {
        "id": 22,
        "name": "Zrir Pignon",
        "type": "Zrir",
        "description": "Une recette délicate à base de pignons, avec du beurre, de l'huile d'olive et du miel de jujubier. Un goût fin et unique.",
        "ingredients": ["pignon", "beurre", "huile d'olive", "miel de jujubier"],
        "variants": [{"size": "250g", "price": 65}, {"size": "500g", "price": 120}, {"size": "1kg", "price": 230}],
        "images": ["/uploads/2ffed165-2ccd-4b9d-8d1c-9d0749c2907e.jpg", "/uploads/b212b41a-6900-4caa-94d5-980c36b300e2.jpg", "/uploads/1bc5e2f5-5d53-41fe-9c09-ab46426002df.jpg"],
        "main_image_index": 0
    },
    {
        "id": 25,
        "name": "Bsissa Pistache",
        "type": "Bsissa",
        "description": "Une bsissa raffinée qui marie le blé à la pistache pour un goût unique et délicat. L'huile d'olive et le miel de jujubier viennent compléter cette recette en apportant une touche de douceur et d'équilibre. Parfaite pour les amateurs de saveurs fines et naturelles.",
        "ingredients": ["blé", "pistache", "huile d'olive", "miel de jujubier"],
        "variants": [{"size": "250g", "price": 23}, {"size": "500g", "price": 40}, {"size": "1kg", "price": 80}],
        "images": ["/uploads/e5de4cdf-06e8-42cc-8dc0-f52b7436a08a.jpg", "/uploads/155b6bb9-3fca-430f-942a-81d1a77f1cd7.jpg", "/uploads/0dbbc77a-5f0d-4dd0-b11c-688233e3ad1e.jpg"],
        "main_image_index": 0
    },
    {
        "id": 23,
        "name": "Bsissa Sésame",
        "type": "Bsissa",
        "description": "Une recette traditionnelle tunisienne riche et authentique, préparée à base de blé finement moulu et de sésame soigneusement sélectionné. Sublimée par une huile d'olive de qualité et du miel de jujubier, cette bsissa offre une texture onctueuse et un goût délicatement parfumé, idéal pour un petit-déjeuner énergétique ou une pause saine.",
        "ingredients": ["blé", "sésame", "huile d'olive", "miel de jujubier"],
        "variants": [{"size": "250g", "price": 15}, {"size": "500g", "price": 30}, {"size": "1kg", "price": 50}],
        "images": ["/uploads/4758327f-4991-4741-8a44-ff7b74248656.jpg", "/uploads/653ecf62-61e9-49a0-9ff8-000efdeff8f7.jpg", "/uploads/e077a237-47ea-4f76-9767-8c3016c85b7e.jpg", "/uploads/1e56d054-bea4-4947-991a-41dffa2be5df.jpg"],
        "main_image_index": 0
    },
    {
        "id": 26,
        "name": "Bsissa Royale",
        "type": "Bsissa",
        "description": "Une version riche et généreuse de la bsissa traditionnelle, combinant blé, sésame, noisette, pistache, noix et amande. Cette recette complète, sublimée par l'huile d'olive et le miel de jujubier, offre une explosion de saveurs et une valeur nutritionnelle exceptionnelle. Idéale pour les gourmets en quête d'authenticité et d'énergie.",
        "ingredients": ["blé", "sésame", "noisette", "pistache", "noix", "amande", "huile d'olive", "le miel de jujubier"],
        "variants": [{"size": "250g", "price": 25}, {"size": "500g", "price": 45}, {"size": "1kg", "price": 85}],
        "images": ["/uploads/0ab3af8f-68d5-4825-8433-6547d2c819fb.jpg", "/uploads/717d61d4-d46f-48d7-b76c-2f4bc9353358.jpeg", "/uploads/f3fa8fbf-2eeb-429e-9762-dd6e4ff20dc8.jpg"],
        "main_image_index": 0
    }
]

with open("seed_products.sql", "w", encoding="utf-8") as f:
    f.write("-- Fichier pour insérer les produits dans la base de données de production\n\n")
    for p in products:
        name = p["name"].replace("'", "''")
        type_ = p["type"].replace("'", "''")
        desc = p["description"].replace("'", "''")
        ing = json.dumps(p["ingredients"], ensure_ascii=False).replace("'", "''")
        var = json.dumps(p["variants"], ensure_ascii=False).replace("'", "''")
        img = json.dumps(p["images"], ensure_ascii=False).replace("'", "''")
        
        sql = f"INSERT INTO products (id, name, type, description, ingredients, variants, images, main_image_index) VALUES ({p['id']}, '{name}', '{type_}', '{desc}', '{ing}'::jsonb, '{var}'::jsonb, '{img}'::jsonb, {p['main_image_index']});\n"
        f.write(sql)
    f.write("\n-- Mettre à jour la séquence id pour éviter les conflits futurs\n")
    f.write("SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));\n")

print("SQL generated successfully!")
