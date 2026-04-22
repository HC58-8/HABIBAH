const nodemailer = require("nodemailer");
require("dotenv").config();
const nodemailer = require("nodemailer");

async function testEmail() {
  console.log("🔍 Testing SMTP Connection...");

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // TLS sur le port 587
    auth: {
      user: process.env.SMTP_LOGIN, // login Brevo
      pass: process.env.EMAIL_PASS, // clé SMTP (mot de passe d’application)
    },
    tls: { rejectUnauthorized: false },
  });

  try {
    await transporter.verify();
    console.log("✅ [CONNECTION SUCCESS] SMTP server is reachable and credentials are correct.");
    const info = await transporter.sendMail({
      from: `"Habibah Test" <${process.env.SMTP_LOGIN}>`,
      to: process.env.SMTP_LOGIN,
      subject: "Test Connexion SMTP – Habibah",
      text: "Ce mail confirme que la configuration SMTP Brevo fonctionne.",
    });
    console.log("📧 [SEND SUCCESS] Test email sent! ID:", info.messageId);
  } catch (err) {
    console.error("❌ [ERROR] SMTP Connection failed:");
    console.error("- Message:", err.message);
    console.error("- Code:", err.code);
    console.error("- Command:", err.command);
    console.log("\n💡 TIPS:");
    if (err.code === "EAUTH") {
      console.log("-> Authentification échouée. Vérifiez que la clé SMTP (EMAIL_PASS) correspond bien à votre compte Brevo.");
    } else if (err.code === 'ESOCKET') {
      console.log("-> Erreur réseau. Vérifiez que le port 587 est ouvert sur votre serveur.");
    }
  }
}

testEmail();
