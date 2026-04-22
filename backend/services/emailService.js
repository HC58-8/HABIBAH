// --- BEGIN Brevo API fallback ---
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function sendViaBrevoApi({to, subject, htmlContent}) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('BREVO_API_KEY not set');
  const body = JSON.stringify({
    sender:{email: process.env.EMAIL_USER, name: 'Habibah'},
    to:[{email: to}],
    subject,
    htmlContent,
  });
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method:'POST',
    headers:{'api-key': apiKey, 'Content-Type':'application/json', 'accept':'application/json'},
    body,
  });
  if (!response.ok) {
    const txt = await response.text();
    throw new Error(`Brevo API error ${response.status}: ${txt}`);
  }
  return await response.json();
}
// --- END Brevo API fallback ---

const nodemailer = require("nodemailer");
const dns = require("dns");

// Fix IPv6 issue on OVH VPS connecting to Google
dns.setDefaultResultOrder("ipv4first");

// ── Transporter Brevo SMTP (port 2525, non bloqué par OVH) ──
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: parseInt(process.env.SMTP_PORT) || 2525,
  secure: false,
  auth: {
    user: process.env.SMTP_LOGIN || process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// ── Vérification API ────────────────────────
console.log("✅ [EMAIL] Configuration Email initialisée via l'API Brevo.");

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
          <tr>
            <td style="background:linear-gradient(135deg,#5C3A1E,#C4882C);padding:40px 48px;text-align:center;">
              <div style="display:inline-block;width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,0.2);line-height:64px;font-size:28px;margin-bottom:16px;">ح</div>
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:900;letter-spacing:-0.5px;">Habibah</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Produits artisanaux tunisiens</p>
            </td>
          </tr>
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
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 36px;">
                    <div style="display:inline-block;background:linear-gradient(135deg,#5C3A1E,#C4882C);border-radius:16px;padding:24px 48px;">
                      <span style="font-size:40px;font-weight:900;color:#ffffff;letter-spacing:10px;font-family:Georgia,serif;">${code}</span>
                    </div>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#FCFAED;border-radius:12px;margin-bottom:32px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 8px;font-size:13px;color:#666;font-family:Arial,sans-serif;">⏱️ <strong>Ce code expire dans 10 minutes.</strong></p>
                    <p style="margin:0;font-size:13px;color:#666;font-family:Arial,sans-serif;">🔒 Si vous n'avez pas demandé ce code, ignorez simplement cet email.</p>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:13px;color:#999;font-family:Arial,sans-serif;">
                Vous avez besoin d'aide ? Contactez-nous à 
                <a href="mailto:contact@zrirhabibah.com" style="color:#C4882C;">contact@zrirhabibah.com</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9f7ee;padding:24px 48px;border-top:1px solid #ede9d4;text-align:center;">
              <p style="margin:0;font-size:12px;color:#aaa;font-family:Arial,sans-serif;">© ${new Date().getFullYear()} Habibah · Produits artisanaux tunisiens 🇹🇳</p>
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
  try {
    const info = await sendViaBrevoApi({
      to: email,
      subject: `${code} — Votre code de vérification Habibah`,
      htmlContent: buildOTPEmailHTML(code, firstname)
    });
    console.log(`✅ [EMAIL] OTP envoyé à ${email} — MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ [EMAIL] Erreur envoi à ${email}:`, error.message);
    throw new Error("Impossible d'envoyer l'email de vérification");
  }
}; 

// ── Template HTML email Réinitialisation MDP ───────────────────
const buildPasswordResetEmailHTML = (code, firstname = "") => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Réinitialisation Mot de passe Habibah</title>
</head>
<body style="margin:0;padding:0;background-color:#FCFAED;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FCFAED;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#5C3A1E,#C4882C);padding:40px 48px;text-align:center;">
              <div style="display:inline-block;width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,0.2);line-height:64px;font-size:28px;margin-bottom:16px;">🔐</div>
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:900;letter-spacing:-0.5px;">Habibah</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Code de récupération</p>
            </td>
          </tr>
          <tr>
            <td style="padding:48px;">
              <p style="margin:0 0 8px;font-size:13px;color:#C4882C;font-weight:700;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Récupération de compte</p>
              <h2 style="margin:0 0 20px;font-size:26px;color:#1a1a1a;font-weight:900;">
                ${firstname ? `Bonjour ${firstname} 👋` : "Bonjour 👋"}
              </h2>
              <p style="margin:0 0 32px;font-size:15px;color:#555;line-height:1.7;font-family:Arial,sans-serif;">
                Vous (ou quelqu'un d'autre) avez demandé la réinitialisation du mot de passe de votre compte <strong>Habibah</strong>. 
                Voici votre code de sécurité :
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 36px;">
                    <div style="display:inline-block;background:linear-gradient(135deg,#d22a2a,#ff5d5d);border-radius:16px;padding:24px 48px;">
                      <span style="font-size:40px;font-weight:900;color:#ffffff;letter-spacing:10px;font-family:Georgia,serif;">${code}</span>
                    </div>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#FCFAED;border-radius:12px;margin-bottom:32px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 8px;font-size:13px;color:#666;font-family:Arial,sans-serif;">⏱️ <strong>Ce code expire dans 10 minutes.</strong></p>
                    <p style="margin:0;font-size:13px;color:#666;font-family:Arial,sans-serif;">🔒 Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet e-mail.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ── Envoyer l'email de réinitialisation ───────────────────────
const sendPasswordResetEmail = async (email, code, firstname = "") => {
  try {
    const info = await sendViaBrevoApi({
      to: email,
      subject: `🔐 Réinitialisation de votre mot de passe Habibah`,
      htmlContent: buildPasswordResetEmailHTML(code, firstname)
    });
    console.log(`✅ [EMAIL] Reset MDP envoyé à ${email} — MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ [EMAIL] Erreur envoi à ${email}:`, error.message);
    throw new Error("Impossible d'envoyer l'email de réinitialisation");
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
<head><meta charset="UTF-8" /><title>${title}</title></head>
<body style="margin:0;padding:0;background-color:#FCFAED;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FCFAED;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#5C3A1E,#C4882C);padding:30px 48px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:900;">Habibah</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">${headerText}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 20px;font-size:24px;color:#1a1a1a;">
                ${isAdmin ? "Une nouvelle commande a été passée." : `Bonjour ${customer.name},`}
              </h2>
              <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;font-family:Arial,sans-serif;">
                ${isAdmin ? "Voici les détails de la commande :" : "Nous avons bien reçu votre commande. Voici le récapitulatif :"}
              </p>
              <div style="background:#f9f9f9;padding:16px;border-radius:12px;margin-bottom:24px;font-family:Arial,sans-serif;font-size:14px;color:#333;">
                <h3 style="margin:0 0 10px;font-size:16px;color:#C4882C;">Informations Client</h3>
                <p style="margin:4px 0;"><strong>Nom :</strong> ${customer.name}</p>
                <p style="margin:4px 0;"><strong>Téléphone :</strong> ${customer.phone}</p>
                ${customer.email ? `<p style="margin:4px 0;"><strong>Email :</strong> ${customer.email}</p>` : ''}
                <p style="margin:4px 0;"><strong>Adresse :</strong> ${customer.address}</p>
                ${orderData.note ? `<p style="margin:4px 0;"><strong>Note :</strong> ${orderData.note}</p>` : ''}
              </div>
              <h3 style="margin:0 0 10px;font-size:16px;color:#C4882C;font-family:Arial,sans-serif;">Détails des produits</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;color:#333;margin-bottom:24px;border-collapse:collapse;">
                <thead>
                  <tr>
                    <th style="padding:12px;border-bottom:2px solid #ddd;text-align:left;">Produit</th>
                    <th style="padding:12px;border-bottom:2px solid #ddd;text-align:center;">Qté</th>
                    <th style="padding:12px;border-bottom:2px solid #ddd;text-align:right;">Prix Unitaire</th>
                  </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding:16px 12px;text-align:right;font-weight:bold;font-size:16px;">Total :</td>
                    <td style="padding:16px 12px;text-align:right;font-weight:bold;font-size:16px;color:#C4882C;">${orderData.total} DT</td>
                  </tr>
                </tfoot>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#f9f7ee;padding:24px;border-top:1px solid #ede9d4;text-align:center;">
              <p style="margin:0;font-size:12px;color:#aaa;font-family:Arial,sans-serif;">© ${new Date().getFullYear()} Habibah · Produits artisanaux tunisiens 🇹🇳</p>
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
  const adminEmail = process.env.SMTP_LOGIN || "zrirhabibah@gmail.com";
  
  try {
    await sendViaBrevoApi({
      to: adminEmail,
      subject: `🔔 Nouvelle Commande #${orderData.id} - ${orderData.total} DT`,
      htmlContent: buildOrderEmailHTML(orderData, true, customer)
    });
    console.log(`✅ [EMAIL] Notification admin envoyée pour la commande #${orderData.id}`);

    if (customer.email && customer.email.trim() !== '') {
      await sendViaBrevoApi({
        to: customer.email,
        subject: `Confirmation de votre Commande #${orderData.id} chez Habibah`,
        htmlContent: buildOrderEmailHTML(orderData, false, customer)
      });
      console.log(`✅ [EMAIL] Confirmation client envoyée à ${customer.email}`);
    }
  } catch (error) {
    console.error(`❌ [EMAIL] Erreur lors de l'envoi des emails de commande:`, error.message);
  }
};

// ── Template HTML email Bienvenue ─────────────────────────────
const buildWelcomeEmailHTML = (firstname = "") => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bienvenue chez Habibah</title>
</head>
<body style="margin:0;padding:0;background-color:#FCFAED;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FCFAED;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#5C3A1E,#C4882C);padding:40px 48px;text-align:center;">
              <div style="display:inline-block;width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,0.2);line-height:64px;font-size:28px;margin-bottom:16px;">🎉</div>
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:900;letter-spacing:-0.5px;">Habibah</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Produits artisanaux tunisiens</p>
            </td>
          </tr>
          <tr>
            <td style="padding:48px;">
              <h2 style="margin:0 0 20px;font-size:26px;color:#1a1a1a;font-weight:900;">
                ${firstname ? `Bienvenue ${firstname} !` : "Bienvenue !"}
              </h2>
              <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;font-family:Arial,sans-serif;">
                Nous sommes ravis de vous compter parmi nous. Votre compte <strong>Habibah</strong> a été créé avec succès.
              </p>
              <p style="margin:0 0 32px;font-size:15px;color:#555;line-height:1.7;font-family:Arial,sans-serif;">
                Découvrez dès maintenant nos produits artisanaux tunisiens authentiques et de haute qualité !
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9f7ee;padding:24px 48px;border-top:1px solid #ede9d4;text-align:center;">
              <p style="margin:0;font-size:12px;color:#aaa;font-family:Arial,sans-serif;">© ${new Date().getFullYear()} Habibah · Produits artisanaux tunisiens 🇹🇳</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ── Envoyer l'email de Bienvenue ───────────────────────────────
const sendWelcomeEmail = async (email, firstname = "") => {
  try {
    const info = await sendViaBrevoApi({
      to: email,
      subject: `🎉 Bienvenue chez Habibah !`,
      htmlContent: buildWelcomeEmailHTML(firstname)
    });
    console.log(`✅ [EMAIL] Bienvenue envoyé à ${email} — MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ [EMAIL] Erreur envoi bienvenue à ${email}:`, error.message);
  }
};

// ── Template HTML email Connexion OTP ─────────────────────────────
const buildLoginOTPEmailHTML = (code, firstname = "") => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Code de connexion Habibah</title>
</head>
<body style="margin:0;padding:0;background-color:#FCFAED;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FCFAED;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#5C3A1E,#C4882C);padding:40px 48px;text-align:center;">
              <div style="display:inline-block;width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,0.2);line-height:64px;font-size:28px;margin-bottom:16px;">🔐</div>
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:900;letter-spacing:-0.5px;">Habibah</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Code de sécurité</p>
            </td>
          </tr>
          <tr>
            <td style="padding:48px;">
              <p style="margin:0 0 8px;font-size:13px;color:#C4882C;font-weight:700;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Connexion à votre compte</p>
              <h2 style="margin:0 0 20px;font-size:26px;color:#1a1a1a;font-weight:900;">
                ${firstname ? `Bonjour ${firstname} 👋` : "Bonjour 👋"}
              </h2>
              <p style="margin:0 0 32px;font-size:15px;color:#555;line-height:1.7;font-family:Arial,sans-serif;">
                Une tentative de connexion a été détectée pour votre compte <strong>Habibah</strong>. 
                Voici votre code de sécurité pour autoriser l'accès :
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 36px;">
                    <div style="display:inline-block;background:linear-gradient(135deg,#5C3A1E,#C4882C);border-radius:16px;padding:24px 48px;">
                      <span style="font-size:40px;font-weight:900;color:#ffffff;letter-spacing:10px;font-family:Georgia,serif;">${code}</span>
                    </div>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#FCFAED;border-radius:12px;margin-bottom:32px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 8px;font-size:13px;color:#666;font-family:Arial,sans-serif;">⏱️ <strong>Ce code expire dans 10 minutes.</strong></p>
                    <p style="margin:0;font-size:13px;color:#666;font-family:Arial,sans-serif;">🔒 Si vous n'avez pas tenté de vous connecter, veuillez ignorer cet email et vérifier la sécurité de votre compte.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#f9f7ee;padding:24px 48px;border-top:1px solid #ede9d4;text-align:center;">
              <p style="margin:0;font-size:12px;color:#aaa;font-family:Arial,sans-serif;">© ${new Date().getFullYear()} Habibah · Produits artisanaux tunisiens 🇹🇳</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ── Envoyer l'email OTP de Connexion ───────────────────────────────
const sendLoginOTPEmail = async (email, code, firstname = "") => {
  try {
    const info = await sendViaBrevoApi({
      to: email,
      subject: `🔐 Code de connexion Habibah`,
      htmlContent: buildLoginOTPEmailHTML(code, firstname)
    });
    console.log(`✅ [EMAIL] Login OTP envoyé à ${email} — MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ [EMAIL] Erreur envoi Login OTP à ${email}:`, error.message);
    throw new Error("Impossible d'envoyer l'email de connexion");
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendOrderEmails,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendLoginOTPEmail,
};