// services/emailService.js
const nodemailer = require("nodemailer");

// ── Transporter ──────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // votre adresse Gmail
    pass: process.env.EMAIL_PASS, // mot de passe d'application Gmail (pas votre mdp normal)
  },
});

// ── Vérifier la connexion au démarrage ────────────────────────
transporter.verify((error) => {
  if (error) {
    console.error("❌ [EMAIL] Erreur de connexion SMTP:", error.message);
  } else {
    console.log("✅ [EMAIL] Service email prêt");
  }
});

// ── Générer un code OTP à 6 chiffres ─────────────────────────
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ── Template HTML email OTP ───────────────────────────────────
const buildOTPEmailHTML = (code, firstname = "") => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vérification Habibah</title>
</head>
<body style="margin:0;padding:0;background-color:#FCFAED;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FCFAED;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#5C3A1E,#C4882C);padding:40px 48px;text-align:center;">
              <div style="display:inline-block;width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,0.2);line-height:64px;font-size:28px;margin-bottom:16px;">ح</div>
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:900;letter-spacing:-0.5px;">Habibah</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Produits artisanaux tunisiens</p>
            </td>
          </tr>

          <!-- Corps -->
          <tr>
            <td style="padding:48px;">
              <p style="margin:0 0 8px;font-size:13px;color:#C4882C;font-weight:700;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Vérification de votre email</p>
              <h2 style="margin:0 0 20px;font-size:26px;color:#1a1a1a;font-weight:900;">
                ${firstname ? `Bonjour ${firstname} 👋` : "Bonjour 👋"}
              </h2>
              <p style="margin:0 0 32px;font-size:15px;color:#555;line-height:1.7;font-family:Arial,sans-serif;">
                Merci de vous inscrire sur <strong>Habibah</strong>. Pour confirmer votre adresse email
                et finaliser la création de votre compte, saisissez le code ci-dessous :
              </p>

              <!-- Code OTP -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 36px;">
                    <div style="display:inline-block;background:linear-gradient(135deg,#5C3A1E,#C4882C);border-radius:16px;padding:24px 48px;">
                      <span style="font-size:40px;font-weight:900;color:#ffffff;letter-spacing:10px;font-family:Georgia,serif;">
                        ${code}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Infos -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#FCFAED;border-radius:12px;margin-bottom:32px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 8px;font-size:13px;color:#666;font-family:Arial,sans-serif;">
                      ⏱️ <strong>Ce code expire dans 10 minutes.</strong>
                    </p>
                    <p style="margin:0;font-size:13px;color:#666;font-family:Arial,sans-serif;">
                      🔒 Si vous n'avez pas demandé ce code, ignorez simplement cet email.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#999;font-family:Arial,sans-serif;">
                Vous avez besoin d'aide ? Contactez-nous à 
                <a href="mailto:zrirhabibah@gmail.com" style="color:#C4882C;">zrirhabibah@gmail.com</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9f7ee;padding:24px 48px;border-top:1px solid #ede9d4;text-align:center;">
              <p style="margin:0;font-size:12px;color:#aaa;font-family:Arial,sans-serif;">
                © ${new Date().getFullYear()} Habibah · Produits artisanaux tunisiens 🇹🇳
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ── Envoyer l'email OTP ───────────────────────────────────────
const sendOTPEmail = async (email, code, firstname = "") => {
  const mailOptions = {
    from: `"Habibah 🇹🇳" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `${code} — Votre code de vérification Habibah`,
    html: buildOTPEmailHTML(code, firstname),
    text: `Votre code de vérification Habibah est : ${code}\nCe code expire dans 10 minutes.`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [EMAIL] OTP envoyé à ${email} — MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ [EMAIL] Erreur envoi à ${email}:`, error.message);
    throw new Error("Impossible d'envoyer l'email de vérification");
  }
}; 

// ── Template HTML email Commande ────────────────────────────────
const buildOrderEmailHTML = (orderData, isAdmin, customer) => {
  const title = isAdmin ? `Nouvelle Commande #${orderData.id}` : `Confirmation de votre Commande #${orderData.id}`;
  const headerText = isAdmin ? "Nouvelle commande reçue" : "Merci pour votre commande !";

  let itemsHtml = orderData.items.map(item => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #eee;">
        <strong>${item.name || item.productName || item.productname || 'Produit'}</strong> ${item.size ? `(${item.size})` : ''}
      </td>
      <td style="padding:12px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
      <td style="padding:12px;border-bottom:1px solid #eee;text-align:right;">${item.price || item.unit_price} DT</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#FCFAED;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FCFAED;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#5C3A1E,#C4882C);padding:30px 48px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:900;">Habibah</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">${headerText}</p>
            </td>
          </tr>

          <!-- Corps -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 20px;font-size:24px;color:#1a1a1a;">
                ${isAdmin ? "Une nouvelle commande a été passée." : `Bonjour ${customer.name},`}
              </h2>
              <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;font-family:Arial,sans-serif;">
                ${isAdmin 
                  ? "Voici les détails de la commande :" 
                  : "Nous avons bien reçu votre commande. Elle est actuellement en cours de traitement. Voici le récapitulatif :"
                }
              </p>

              <!-- Coordonnées Client -->
              <div style="background:#f9f9f9;padding:16px;border-radius:12px;margin-bottom:24px;font-family:Arial,sans-serif;font-size:14px;color:#333;">
                <h3 style="margin:0 0 10px;font-size:16px;color:#C4882C;">Informations Client</h3>
                <p style="margin:4px 0;"><strong>Nom :</strong> ${customer.name}</p>
                <p style="margin:4px 0;"><strong>Téléphone :</strong> ${customer.phone}</p>
                ${customer.email ? `<p style="margin:4px 0;"><strong>Email :</strong> ${customer.email}</p>` : ''}
                <p style="margin:4px 0;"><strong>Adresse :</strong> ${customer.address}</p>
                ${orderData.note ? `<p style="margin:4px 0;"><strong>Note :</strong> ${orderData.note}</p>` : ''}
              </div>

              <!-- Détails de la commande -->
              <h3 style="margin:0 0 10px;font-size:16px;color:#C4882C;font-family:Arial,sans-serif;">Détails des produits</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;color:#333;margin-bottom:24px;border-collapse:collapse;">
                <thead>
                  <tr>
                    <th style="padding:12px;border-bottom:2px solid #ddd;text-align:left;">Produit</th>
                    <th style="padding:12px;border-bottom:2px solid #ddd;text-align:center;">Qté</th>
                    <th style="padding:12px;border-bottom:2px solid #ddd;text-align:right;">Prix Unitaire</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding:16px 12px;text-align:right;font-weight:bold;font-size:16px;">Total :</td>
                    <td style="padding:16px 12px;text-align:right;font-weight:bold;font-size:16px;color:#C4882C;">${orderData.total} DT</td>
                  </tr>
                </tfoot>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9f7ee;padding:24px;border-top:1px solid #ede9d4;text-align:center;">
              <p style="margin:0;font-size:12px;color:#aaa;font-family:Arial,sans-serif;">
                © ${new Date().getFullYear()} Habibah · Produits artisanaux tunisiens 🇹🇳
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

// ── Envoyer les emails de commande ─────────────────────────────
const sendOrderEmails = async (orderData, customer) => {
  const adminEmail = process.env.EMAIL_USER || "zrirhabibah@gmail.com";
  
  // 1. Définir l'email admin
  const adminMailOptions = {
    from: `"Habibah 🇹🇳" <${adminEmail}>`,
    to: adminEmail,
    subject: `🔔 Nouvelle Commande #${orderData.id} - ${orderData.total} DT`,
    html: buildOrderEmailHTML(orderData, true, customer),
  };

  try {
    // Envoi à l'admin
    await transporter.sendMail(adminMailOptions);
    console.log(`✅ [EMAIL] Notification admin envoyée pour la commande #${orderData.id}`);

    // 2. Si le client a un email, lui envoyer la confirmation
    if (customer.email && customer.email.trim() !== '') {
      const clientMailOptions = {
        from: `"Habibah 🇹🇳" <${adminEmail}>`,
        to: customer.email,
        subject: `Confirmation de votre Commande #${orderData.id} chez Habibah`,
        html: buildOrderEmailHTML(orderData, false, customer),
      };
      
      await transporter.sendMail(clientMailOptions);
      console.log(`✅ [EMAIL] Confirmation client envoyée à ${customer.email}`);
    }
  } catch (error) {
    console.error(`❌ [EMAIL] Erreur lors de l'envoi des emails de commande:`, error.message);
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendOrderEmails,
};