const nodemailer = require("nodemailer");
require("dotenv").config();

async function testEmail() {
  console.log("🔍 Testing SMTP Connection...");
  console.log("📧 User:", process.env.EMAIL_USER);
  console.log("🔑 Password:", process.env.EMAIL_PASS ? "******** (Hidden)" : "MISSING");

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    const success = await transporter.verify();
    if (success) {
      console.log("✅ [CONNECTION SUCCESS] SMTP server is reachable and credentials are CORECT.");
      
      const info = await transporter.sendMail({
        from: `"Test Habibah" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER, // Envoyer à soi-même
        subject: "Test Connexion SMTP - Habibah",
        text: "Ceci est un test de connexion pour vérifier que votre configuration email fonctionne sur Render.",
      });

      console.log("📧 [SEND SUCCESS] Test email sent! ID:", info.messageId);
    }
  } catch (error) {
    console.error("❌ [ERROR] SMTP Connection failed:");
    console.error("- Message:", error.message);
    console.error("- Code:", error.code);
    console.error("- Command:", error.command);
    console.log("\n💡 TIPS:");
    if (error.code === 'EAUTH') {
      console.log("-> Authentification échouée. Vérifiez que vous utilisez bien un 'MOT DE PASSE D'APPLICATION' et non votre mot de passe habituel.");
    } else if (error.code === 'ESOCKET') {
      console.log("-> Erreur réseau. Vérifiez que le port 587 est ouvert sur votre serveur.");
    }
  }
}

testEmail();
