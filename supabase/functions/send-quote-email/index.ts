import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const GMAIL_CLIENT_ID = Deno.env.get("GMAIL_CLIENT_ID");
const GMAIL_CLIENT_SECRET = Deno.env.get("GMAIL_CLIENT_SECRET");
const GMAIL_REFRESH_TOKEN = Deno.env.get("GMAIL_REFRESH_TOKEN");
const GMAIL_USER_EMAIL = Deno.env.get("GMAIL_USER_EMAIL");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartItem {
  item: {
    title: string;
    img: string;
  };
  horario: string;
  bartenders: string;
  convidados: string;
  valorTotalFormatado: string;
}

interface EventDetails {
  cep: string;
  rua: string;
  numero: string;
  complemento?: string;
  uf: string;
  bairro: string;
  cidade: string;
  dataEvento: string;
  horaInicio: string;
  horaEncerramento: string;
}

interface QuoteEmailRequest {
  userEmail: string;
  userName: string;
  cartItems: CartItem[];
  totalAmount: string;
  pdfBase64?: string;
  eventDetails?: EventDetails;
}

// Get Gmail access token using refresh token
async function getGmailAccessToken(): Promise<string> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: GMAIL_CLIENT_ID!,
      client_secret: GMAIL_CLIENT_SECRET!,
      refresh_token: GMAIL_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error("Failed to get access token:", data);
    throw new Error(`Failed to get access token: ${data.error_description || data.error}`);
  }

  return data.access_token;
}

// Create email in RFC 2822 format with attachment
function createEmail(to: string, subject: string, htmlContent: string, pdfBase64?: string): string {
  const boundary = "boundary_" + Date.now();
  
  let email = [
    `From: Vincci Bartenders <${GMAIL_USER_EMAIL}>`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    "MIME-Version: 1.0",
  ];

  if (pdfBase64) {
    email.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
    email.push("");
    email.push(`--${boundary}`);
    email.push("Content-Type: text/html; charset=UTF-8");
    email.push("Content-Transfer-Encoding: base64");
    email.push("");
    email.push(btoa(unescape(encodeURIComponent(htmlContent))));
    email.push(`--${boundary}`);
    email.push(`Content-Type: application/pdf; name="orcamento-vincci-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf"`);
    email.push("Content-Transfer-Encoding: base64");
    email.push(`Content-Disposition: attachment; filename="orcamento-vincci-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf"`);
    email.push("");
    email.push(pdfBase64);
    email.push(`--${boundary}--`);
  } else {
    email.push("Content-Type: text/html; charset=UTF-8");
    email.push("Content-Transfer-Encoding: base64");
    email.push("");
    email.push(btoa(unescape(encodeURIComponent(htmlContent))));
  }

  return email.join("\r\n");
}

// Send email using Gmail API
async function sendGmailEmail(to: string, subject: string, htmlContent: string, pdfBase64?: string): Promise<any> {
  const accessToken = await getGmailAccessToken();
  const rawEmail = createEmail(to, subject, htmlContent, pdfBase64);
  
  // URL-safe base64 encode
  const encodedEmail = btoa(rawEmail)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/send`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      raw: encodedEmail,
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error("Gmail API error:", data);
    throw new Error(`Gmail API error: ${data.error?.message || JSON.stringify(data)}`);
  }

  return data;
}

const formatEventDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  } catch {
    return dateStr;
  }
};

const generateEmailHTML = (userName: string, cartItems: CartItem[], totalAmount: string, eventDetails?: EventDetails): string => {
  const itemsHTML = cartItems.map((item, index) => `
    <tr>
      <td style="padding: 16px; border-bottom: 1px solid #e5e5e5;">
        <div style="font-weight: 600; color: #92753c; margin-bottom: 8px;">
          Item ${index + 1}: ${item.item.title}
        </div>
        <div style="color: #666; font-size: 14px; line-height: 1.6;">
          <div>⏰ Horário: ${item.horario} Horas</div>
          <div>👨‍🍳 Bartenders: ${item.bartenders}</div>
          <div>👥 Convidados: ${item.convidados}</div>
          <div style="font-weight: 600; color: #333; margin-top: 8px;">
            💰 Valor: R$ ${item.valorTotalFormatado}
          </div>
        </div>
      </td>
    </tr>
  `).join('');

  const eventDetailsHTML = eventDetails ? `
    <!-- Event Details -->
    <tr>
      <td style="padding: 0 30px 20px;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fafafa; border-radius: 8px;">
          <tr>
            <td style="padding: 16px; background-color: #92753c; border-radius: 8px 8px 0 0;">
              <span style="color: #ffffff; font-weight: 600; font-size: 16px;">
                📍 Detalhes do Evento
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px;">
              <div style="color: #666; font-size: 14px; line-height: 1.8;">
                <div style="margin-bottom: 8px;">
                  <strong style="color: #333;">Endereço:</strong><br>
                  ${eventDetails.rua}, ${eventDetails.numero}${eventDetails.complemento ? ` - ${eventDetails.complemento}` : ''}<br>
                  ${eventDetails.bairro}, ${eventDetails.cidade} - ${eventDetails.uf}<br>
                  CEP: ${eventDetails.cep}
                </div>
                <div style="margin-bottom: 8px;">
                  <strong style="color: #333;">📅 Data do Evento:</strong> ${formatEventDate(eventDetails.dataEvento)}
                </div>
                <div>
                  <strong style="color: #333;">🕐 Horário:</strong> ${eventDetails.horaInicio} às ${eventDetails.horaEncerramento}
                </div>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Orçamento - Vincci Bartenders</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #92753c 0%, #b8956c 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: 1px;">
                VINCCI BARTENDERS
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                Orçamento Personalizado
              </p>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding: 30px 30px 20px;">
              <h2 style="margin: 0 0 15px; color: #333; font-size: 22px;">
                Olá, ${userName}! 👋
              </h2>
              <p style="margin: 0; color: #666; font-size: 15px; line-height: 1.6;">
                Segue em anexo o orçamento dos serviços selecionados. Abaixo você encontra um resumo do seu pedido:
              </p>
            </td>
          </tr>
          
          <!-- Items Table -->
          <tr>
            <td style="padding: 0 30px 20px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fafafa; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px; background-color: #92753c; border-radius: 8px 8px 0 0;">
                    <span style="color: #ffffff; font-weight: 600; font-size: 16px;">
                      📋 Itens do Orçamento
                    </span>
                  </td>
                </tr>
                ${itemsHTML}
              </table>
            </td>
          </tr>

          ${eventDetailsHTML}
          
          <!-- Total -->
          <tr>
            <td style="padding: 25px 30px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #92753c 0%, #b8956c 100%); border-radius: 8px;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <span style="color: rgba(255, 255, 255, 0.9); font-size: 14px; display: block; margin-bottom: 5px;">
                      VALOR TOTAL
                    </span>
                    <span style="color: #ffffff; font-size: 28px; font-weight: 700;">
                      ${totalAmount}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- CTA -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <p style="margin: 0 0 20px; color: #666; font-size: 14px;">
                O PDF completo do orçamento está em anexo neste email.
              </p>
              <a href="https://wa.me/5511999999999" style="display: inline-block; background-color: #25D366; color: #ffffff; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
                💬 Falar no WhatsApp
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f8f8; padding: 25px 30px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0 0 10px; color: #92753c; font-weight: 600; font-size: 14px;">
                Vincci Bartenders
              </p>
              <p style="margin: 0; color: #999; font-size: 12px; line-height: 1.5;">
                Este é um email automático. <br>
                Por favor, não responda diretamente a este email.
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

const handler = async (req: Request): Promise<Response> => {
  console.log("Received request to send-quote-email");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, userName, cartItems, totalAmount, pdfBase64, eventDetails }: QuoteEmailRequest = await req.json();

    console.log(`Sending quote email to: ${userEmail}`);
    console.log(`Number of items: ${cartItems.length}`);
    console.log(`Event details provided: ${!!eventDetails}`);

    const emailHTML = generateEmailHTML(userName, cartItems, totalAmount, eventDetails);

    // Send email via Gmail API
    const emailResponse = await sendGmailEmail(
      userEmail,
      "Seu Orçamento - Vincci Bartenders",
      emailHTML,
      pdfBase64 && pdfBase64.length > 0 ? pdfBase64 : undefined
    );

    console.log("Email sent successfully via Gmail:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-quote-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
