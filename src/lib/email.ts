import nodemailer from "nodemailer";

// Configuration du transporteur Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface WelcomeEmailData {
  firstName: string;
  lastName: string;
  email: string;
}

export async function sendWelcomeEmail(data: WelcomeEmailData) {
  const { firstName, lastName, email } = data;

  const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue à MPS Trading Academy</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">MPS Trading Academy</h1>
              <p style="margin: 10px 0 0; color: #fecaca; font-size: 14px;">Votre parcours vers le succès en trading commence ici</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px;">
                Bienvenue ${firstName} ${lastName} ! 🎉
              </h2>
              
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Nous avons bien reçu votre demande d'inscription à notre formation trading. 
                Nous sommes ravis de vous accueillir dans notre communauté d'apprenants !
              </p>
              
              <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                <h3 style="margin: 0 0 10px; color: #991b1b; font-size: 18px;">✅ Vous pouvez commencer la formation !</h3>
                <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.5;">
                  Votre inscription est confirmée. Vous recevrez bientôt les détails concernant 
                  les horaires et le programme de formation.
                </p>
              </div>
              
              <h3 style="margin: 30px 0 15px; color: #1f2937; font-size: 18px;">💳 Modalités de paiement</h3>
              
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 15px; background-color: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
                    <div style="display: flex; align-items: center;">
                      <span style="font-size: 24px; margin-right: 10px;">📅</span>
                      <div>
                        <strong style="color: #166534; font-size: 16px;">1ère tranche : 40%</strong>
                        <p style="margin: 5px 0 0; color: #15803d; font-size: 14px;">À payer dans les 15 prochains jours</p>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;"></td>
                </tr>
                <tr>
                  <td style="padding: 15px; background-color: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe;">
                    <div style="display: flex; align-items: center;">
                      <span style="font-size: 24px; margin-right: 10px;">📆</span>
                      <div>
                        <strong style="color: #1e40af; font-size: 16px;">2ème tranche : 60%</strong>
                        <p style="margin: 5px 0 0; color: #1d4ed8; font-size: 14px;">À payer avant la fin de la formation</p>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Si vous avez des questions, n'hésitez pas à nous contacter. 
                Notre équipe est là pour vous accompagner tout au long de votre formation.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" 
                   style="display: inline-block; padding: 14px 30px; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Accéder à la plateforme
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                À bientôt dans la formation !
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} MPS Trading Academy. Tous droits réservés.
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

  const textContent = `
Bienvenue ${firstName} ${lastName} !

Nous avons bien reçu votre demande d'inscription à MPS Trading Academy.
Nous sommes ravis de vous accueillir dans notre communauté d'apprenants !

✅ VOUS POUVEZ COMMENCER LA FORMATION !
Votre inscription est confirmée. Vous recevrez bientôt les détails concernant les horaires et le programme de formation.

💳 MODALITÉS DE PAIEMENT

📅 1ère tranche : 40%
   À payer dans les 15 prochains jours

📆 2ème tranche : 60%
   À payer avant la fin de la formation

Si vous avez des questions, n'hésitez pas à nous contacter.
Notre équipe est là pour vous accompagner tout au long de votre formation.

À bientôt dans la formation !

---
© ${new Date().getFullYear()} MPS Trading Academy. Tous droits réservés.
  `;

  try {
    await transporter.sendMail({
      from: `"MPS Trading Academy" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "🎉 Bienvenue à MPS Trading Academy - Inscription confirmée !",
      text: textContent,
      html: htmlContent,
    });

    console.log(`Email de bienvenue envoyé à ${email}`);
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    return { success: false, error };
  }
}
