import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

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

interface QuoteEmailRequest {
  userEmail: string;
  userName: string;
  cartItems: CartItem[];
  totalAmount: string;
  pdfBase64: string;
}

const generateEmailHTML = (userName: string, cartItems: CartItem[], totalAmount: string): string => {
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
            <td style="padding: 0 30px;">
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
    const { userEmail, userName, cartItems, totalAmount, pdfBase64 }: QuoteEmailRequest = await req.json();

    console.log(`Sending quote email to: ${userEmail}`);
    console.log(`Number of items: ${cartItems.length}`);

    const emailHTML = generateEmailHTML(userName, cartItems, totalAmount);

    // Preparar corpo do email
    const emailBody: any = {
      from: "Vincci Bartenders <onboarding@resend.dev>",
      to: [userEmail],
      subject: "Seu Orçamento - Vincci Bartenders",
      html: emailHTML,
    };

    // Adicionar anexo apenas se pdfBase64 estiver disponível
    if (pdfBase64 && pdfBase64.length > 0) {
      emailBody.attachments = [
        {
          filename: `orcamento-vincci-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`,
          content: pdfBase64,
        },
      ];
      console.log("PDF attachment added, size:", pdfBase64.length);
    } else {
      console.log("No PDF attachment - pdfBase64 is null or empty");
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailBody),
    });

    const emailData = await emailResponse.json();
    console.log("Email sent successfully:", emailData);

    if (!emailResponse.ok) {
      throw new Error(emailData.message || "Failed to send email");
    }

    return new Response(JSON.stringify({ success: true, data: emailData }), {
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
