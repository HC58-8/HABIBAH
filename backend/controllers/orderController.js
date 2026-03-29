// controllers/orderController.js
const Order = require("../models/Order");
const { sendOrderEmails } = require("../services/emailService");

// ==================== CRÉER UNE COMMANDE ====================
const createOrder = async (req, res) => {
  try {
    // ✅ Extraire user_id du body en plus des autres champs
    const { customer, note, items, total, user_id } = req.body;

    // ✅ Priorité : token JWT > body user_id > null
    const userId = req.user?.id || user_id || null;

    console.log("\n🔍 [CONTROLLER] ===== DÉBUT CRÉATION COMMANDE =====");
    console.log("🔍 [CONTROLLER] req.user reçu:", req.user);
    console.log("🔍 [CONTROLLER] user_id reçu depuis body:", user_id);
    console.log("🔍 [CONTROLLER] userId final utilisé:", userId);
    console.log("🔍 [CONTROLLER] Type de userId:", typeof userId);
    console.log("🔍 [CONTROLLER] Email client fourni:", customer?.email);
    console.log("🔍 [CONTROLLER] Nom client:", customer?.name);
    console.log("🔍 [CONTROLLER] Téléphone client:", customer?.phone);
    console.log("🔍 [CONTROLLER] Adresse client:", customer?.address);
    console.log("🔍 [CONTROLLER] Note:", note);
    console.log("🔍 [CONTROLLER] Total commande:", total);
    console.log("🔍 [CONTROLLER] Nombre d'articles:", items?.length);

    // ✅ Validation des données client
    if (!customer) {
      console.log("❌ [CONTROLLER] Objet customer manquant");
      return res.status(400).json({
        message: "Informations client requises",
      });
    }

    if (!customer.name || !customer.name.trim()) {
      console.log("❌ [CONTROLLER] Nom client manquant");
      return res.status(400).json({
        message: "Le nom est requis",
      });
    }

    if (!customer.phone || !customer.phone.trim()) {
      console.log("❌ [CONTROLLER] Téléphone client manquant");
      return res.status(400).json({
        message: "Le téléphone est requis",
      });
    }

    if (!customer.address || !customer.address.trim()) {
      console.log("❌ [CONTROLLER] Adresse client manquante");
      return res.status(400).json({
        message: "L'adresse est requise",
      });
    }

    // ✅ Validation du panier
    if (!items || items.length === 0) {
      console.log("❌ [CONTROLLER] Panier vide");
      return res.status(400).json({ message: "Panier vide" });
    }

    // ✅ Validation du total
    if (!total || total <= 0) {
      console.log("❌ [CONTROLLER] Total invalide:", total);
      return res.status(400).json({ message: "Total invalide" });
    }

    // ✅ Validation de chaque item
    for (const item of items) {
      if (!item.productId) {
        console.log("❌ [CONTROLLER] Item sans productId:", item);
        return res.status(400).json({ message: "Produit invalide" });
      }
      if (!item.quantity || item.quantity <= 0) {
        console.log("❌ [CONTROLLER] Quantité invalide pour item:", item);
        return res.status(400).json({ message: "Quantité invalide" });
      }
    }

    console.log("📦 [CONTROLLER] Appel de Order.createOrder avec userId:", userId);

    // ✅ Créer la commande avec userId correctement résolu
    const order = await Order.createOrder({
      customer,
      note,
      userId, // ← Correctement résolu : token > body > null
      items,
      total,
    });

    console.log("✅ [CONTROLLER] Commande créée avec succès!");
    console.log("✅ [CONTROLLER] ID commande:", order.id);
    console.log("✅ [CONTROLLER] userId associé à la commande:", userId);

    // ✅ Envoi des emails de notification (admin + client si email fourni)
    // On n'attend pas la fin de l'envoi pour répondre au front (pas de await) pour ne pas ralentir l'UX
    sendOrderEmails({
      id: order.id,
      items,
      total,
      note
    }, customer).catch(err => console.error("Erreur asynchrone e-mail:", err));

    console.log("🔍 [CONTROLLER] ===== FIN CRÉATION COMMANDE =====\n");

    res.status(201).json({
      message: "Commande créée avec succès",
      order: {
        id: order.id,
        created_at: order.created_at,
        total: order.total,
        status: "pending",
      },
    });
  } catch (error) {
    console.error("❌ [CONTROLLER] Erreur création commande:", error);
    res.status(500).json({
      message: "Erreur lors de la création de la commande",
      error: error.message,
    });
  }
};

// ==================== RÉCUPÉRER TOUTES LES COMMANDES (admin) ====================
const getAllOrders = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      console.log(
        "❌ [CONTROLLER] Accès refusé - utilisateur non admin:",
        req.user?.email
      );
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    console.log(
      `🔍 [CONTROLLER] Chargement de toutes les commandes pour admin: ${req.user?.email}`
    );
    const orders = await Order.getAllOrders();

    console.log(`✅ [CONTROLLER] ${orders.length} commandes trouvées`);
    res.json(orders);
  } catch (error) {
    console.error("❌ [CONTROLLER] Erreur récupération commandes:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des commandes",
      error: error.message,
    });
  }
};

// ==================== RÉCUPÉRER COMMANDES DE L'UTILISATEUR CONNECTÉ ====================
const getMyOrders = async (req, res) => {
  try {
    console.log("\n🔍 [CONTROLLER] ===== DÉBUT RÉCUPÉRATION MES COMMANDES =====");
    console.log("🔍 [CONTROLLER] req.user reçu:", req.user);

    const userId = req.user?.id;
    console.log("🔍 [CONTROLLER] userId extrait:", userId);

    if (!userId) {
      console.log("❌ [CONTROLLER] userId manquant - req.user =", req.user);
      return res.status(401).json({ message: "Utilisateur non connecté" });
    }

    console.log("✅ [CONTROLLER] Chargement commandes pour userId:", userId);
    const orders = await Order.getUserOrders(userId);

    console.log(`✅ [CONTROLLER] ${orders.length} commandes trouvées`);
    console.log("🔍 [CONTROLLER] ===== FIN RÉCUPÉRATION =====\n");

    res.json(orders);
  } catch (error) {
    console.error("❌ [CONTROLLER] Erreur getMyOrders:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ==================== RÉCUPÉRER UNE COMMANDE PAR ID ====================
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 [CONTROLLER] Recherche commande ID: ${id}`);

    const order = await Order.getOrderById(id);

    if (!order) {
      console.log(`❌ [CONTROLLER] Commande non trouvée ID: ${id}`);
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    if (req.user?.role !== "admin" && order.user_id !== req.user?.id) {
      console.log(
        `❌ [CONTROLLER] Accès non autorisé - user_id: ${order.user_id}, req.user.id: ${req.user?.id}`
      );
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    console.log(
      `✅ [CONTROLLER] Commande trouvée ID: ${id}, user_id: ${order.user_id}`
    );
    res.json(order);
  } catch (error) {
    console.error("❌ [CONTROLLER] Erreur récupération commande:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération de la commande",
      error: error.message,
    });
  }
};

// ==================== METTRE À JOUR STATUT COMMANDE (admin) ====================
const updateOrderStatus = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      console.log(
        "❌ [CONTROLLER] Accès refusé - utilisateur non admin:",
        req.user?.email
      );
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!status || !validStatuses.includes(status)) {
      console.log("❌ [CONTROLLER] Statut invalide:", status);
      return res.status(400).json({
        message: "Statut invalide",
        validStatuses,
      });
    }

    console.log(
      `🔍 [CONTROLLER] Mise à jour commande ID: ${id}, nouveau statut: ${status}`
    );

    const order = await Order.updateOrderStatus(id, status);

    if (!order) {
      console.log(`❌ [CONTROLLER] Commande non trouvée ID: ${id}`);
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    console.log(`✅ [CONTROLLER] Statut mis à jour pour commande ID: ${id}`);
    res.json({
      message: "Statut mis à jour",
      order,
    });
  } catch (error) {
    console.error("❌ [CONTROLLER] Erreur mise à jour statut:", error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour du statut",
      error: error.message,
    });
  }
};

// ==================== SUPPRIMER COMMANDE (admin) ====================
const deleteOrder = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      console.log(
        "❌ [CONTROLLER] Accès refusé - utilisateur non admin:",
        req.user?.email
      );
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const { id } = req.params;
    console.log(`🔍 [CONTROLLER] Suppression commande ID: ${id}`);

    const deleted = await Order.deleteOrder(id);

    if (!deleted) {
      console.log(`❌ [CONTROLLER] Commande non trouvée ID: ${id}`);
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    console.log(`✅ [CONTROLLER] Commande supprimée avec succès ID: ${id}`);
    res.json({ message: "Commande supprimée avec succès" });
  } catch (error) {
    console.error("❌ [CONTROLLER] Erreur suppression commande:", error);
    res.status(500).json({
      message: "Erreur lors de la suppression de la commande",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
};