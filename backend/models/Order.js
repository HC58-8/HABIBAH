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

    // 1. Insérer la commande principale avec JSONB
    const orderQuery = `
      INSERT INTO orders (
        user_id, 
        customer, 
        items, 
        total, 
        note, 
        status, 
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING id, created_at;
    `;

    const orderValues = [
      userId || null,
      JSON.stringify(customer),
      JSON.stringify(items),
      total,
      note || null,
      'pending'
    ];

    console.log("🔍 [MODEL] orderValues avant insertion:", {
      userId: orderValues[0],
      customer: "Object...",
      itemsCount: items?.length,
      total: orderValues[3]
    });

    const orderResult = await client.query(orderQuery, orderValues);
    const orderId = orderResult.rows[0].id;

    await client.query('COMMIT');
    
    console.log("✅ [MODEL] Commande créée avec succès, ID:", orderId);
    
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
      SELECT * FROM orders
      ORDER BY created_at DESC;
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
      SELECT * FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC;
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
      SELECT * FROM orders
      WHERE id = $1;
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
    
    // Suppression simplifiée (plus besoin de supprimer order_items)
    const result = await client.query('DELETE FROM orders WHERE id = $1 RETURNING id', [orderId]);
    
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