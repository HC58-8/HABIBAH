// models/Order.js
const pool = require("../config/db");

// ==================== CRÉER UNE COMMANDE ====================
const createOrder = async (orderData) => {
  const { 
    customer, 
    note, 
    userId, 
    items, 
    total 
  } = orderData;

  // 🔍 LOGS DE DÉBOGAGE
  console.log("\n🔍 [MODEL] ===== DÉBUT CRÉATION COMMANDE =====");
  console.log("🔍 [MODEL] orderData reçu complet:", JSON.stringify(orderData, null, 2));
  console.log("🔍 [MODEL] userId reçu dans createOrder:", userId);
  console.log("🔍 [MODEL] Type de userId:", typeof userId);
  console.log("🔍 [MODEL] customer.email:", customer?.email);
  console.log("🔍 [MODEL] total:", total);
  console.log("🔍 [MODEL] nombre d'items:", items?.length);

  // Commencer une transaction
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Insérer la commande principale
    const orderQuery = `
      INSERT INTO orders (
        customer_name, 
        customer_phone, 
        customer_address, 
        customer_email,
        note, 
        user_id, 
        total_amount, 
        status, 
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      RETURNING id, created_at;
    `;

    const orderValues = [
      customer.name,
      customer.phone,
      customer.address,
      customer.email || null,
      note || null,
      userId || null,  // ← ICI : userId est utilisé
      total,
      'pending'
    ];

    console.log("🔍 [MODEL] orderValues avant insertion:", orderValues);
    console.log("🔍 [MODEL] Valeur pour user_id dans la requête (index 5):", orderValues[5]);

    const orderResult = await client.query(orderQuery, orderValues);
    const orderId = orderResult.rows[0].id;

    console.log("✅ [MODEL] Commande insérée avec ID:", orderId);
    console.log("✅ [MODEL] user_id inséré dans la base:", orderResult.rows[0].user_id || userId);

    // 2. Insérer les détails de la commande (produits)
    for (const item of items) {
      const itemQuery = `
        INSERT INTO order_items (
          order_id,
          product_id,
          product_name,
          product_size,
          unit_price,
          quantity,
          subtotal
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7);
      `;

      const itemValues = [
        orderId,
        item.productId,
        item.name,
        item.size || null,
        item.price,
        item.quantity,
        item.price * item.quantity
      ];

      await client.query(itemQuery, itemValues);
      console.log(`✅ [MODEL] Item ${item.name} (x${item.quantity}) inséré pour commande ${orderId}`);
    }

    await client.query('COMMIT');
    
    console.log("✅ [MODEL] Commande créée avec succès, userId associé:", userId);
    console.log("🔍 [MODEL] ===== FIN CRÉATION COMMANDE =====\n");
    
    return {
      id: orderId,
      created_at: orderResult.rows[0].created_at,
      ...orderData
    };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("❌ [MODEL] Erreur création commande:", error);
    throw error;
  } finally {
    client.release();
  }
};

// ==================== RÉCUPÉRER TOUTES LES COMMANDES (admin) ====================
const getAllOrders = async () => {
  try {
    console.log("🔍 [MODEL] Récupération de toutes les commandes");
    
    const query = `
      SELECT 
        o.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'productId', oi.product_id,
              'productName', oi.product_name,
              'size', oi.product_size,
              'price', oi.unit_price,
              'quantity', oi.quantity,
              'subtotal', oi.subtotal
            ) ORDER BY oi.id
          ) FILTER (WHERE oi.id IS NOT NULL), '[]'
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC;
    `;
    
    const result = await pool.query(query);
    console.log(`✅ [MODEL] ${result.rows.length} commandes trouvées`);
    return result.rows;
  } catch (error) {
    console.error("❌ [MODEL] Erreur récupération commandes:", error);
    throw error;
  }
};

// ==================== RÉCUPÉRER COMMANDES D'UN UTILISATEUR ====================
const getUserOrders = async (userId) => {
  try {
    console.log(`🔍 [MODEL] Récupération des commandes pour userId: ${userId}`);
    
    const query = `
      SELECT 
        o.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'productId', oi.product_id,
              'productName', oi.product_name,
              'size', oi.product_size,
              'price', oi.unit_price,
              'quantity', oi.quantity,
              'subtotal', oi.subtotal
            ) ORDER BY oi.id
          ) FILTER (WHERE oi.id IS NOT NULL), '[]'
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC;
    `;
    
    const result = await pool.query(query, [userId]);
    console.log(`✅ [MODEL] ${result.rows.length} commandes trouvées pour userId ${userId}`);
    return result.rows;
  } catch (error) {
    console.error("❌ [MODEL] Erreur récupération commandes utilisateur:", error);
    throw error;
  }
};

// ==================== RÉCUPÉRER UNE COMMANDE PAR ID ====================
const getOrderById = async (orderId) => {
  try {
    console.log(`🔍 [MODEL] Récupération commande ID: ${orderId}`);
    
    const query = `
      SELECT 
        o.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'productId', oi.product_id,
              'productName', oi.product_name,
              'size', oi.product_size,
              'price', oi.unit_price,
              'quantity', oi.quantity,
              'subtotal', oi.subtotal
            ) ORDER BY oi.id
          ) FILTER (WHERE oi.id IS NOT NULL), '[]'
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = $1
      GROUP BY o.id;
    `;
    
    const result = await pool.query(query, [orderId]);
    
    if (result.rows[0]) {
      console.log(`✅ [MODEL] Commande ${orderId} trouvée, user_id: ${result.rows[0].user_id}`);
    } else {
      console.log(`❌ [MODEL] Commande ${orderId} non trouvée`);
    }
    
    return result.rows[0];
  } catch (error) {
    console.error("❌ [MODEL] Erreur récupération commande:", error);
    throw error;
  }
};

// ==================== METTRE À JOUR STATUT COMMANDE ====================
const updateOrderStatus = async (orderId, status) => {
  try {
    console.log(`🔍 [MODEL] Mise à jour statut commande ${orderId} -> ${status}`);
    
    const query = `
      UPDATE orders
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `;
    
    const result = await pool.query(query, [status, orderId]);
    
    if (result.rows[0]) {
      console.log(`✅ [MODEL] Statut mis à jour pour commande ${orderId}`);
    } else {
      console.log(`❌ [MODEL] Commande ${orderId} non trouvée pour mise à jour`);
    }
    
    return result.rows[0];
  } catch (error) {
    console.error("❌ [MODEL] Erreur mise à jour statut:", error);
    throw error;
  }
};

// ==================== SUPPRIMER COMMANDE (admin) ====================
const deleteOrder = async (orderId) => {
  const client = await pool.connect();
  
  try {
    console.log(`🔍 [MODEL] Suppression commande ${orderId}`);
    
    await client.query('BEGIN');
    
    // Supprimer d'abord les items
    await client.query('DELETE FROM order_items WHERE order_id = $1', [orderId]);
    console.log(`✅ [MODEL] Items supprimés pour commande ${orderId}`);
    
    // Puis la commande
    const result = await client.query('DELETE FROM orders WHERE id = $1 RETURNING id', [orderId]);
    
    await client.query('COMMIT');
    
    if (result.rows[0]) {
      console.log(`✅ [MODEL] Commande ${orderId} supprimée avec succès`);
    } else {
      console.log(`❌ [MODEL] Commande ${orderId} non trouvée`);
    }
    
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("❌ [MODEL] Erreur suppression commande:", error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder
};