import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderConfirmationRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerTaxId: string;
  pixId: string;
  amount: number;
  items: Array<{
    title: string;
    quantity: number;
    value: string;
  }>;
  paymentDate: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerTaxId,
      pixId,
      amount,
      items,
      paymentDate,
    }: OrderConfirmationRequest = await req.json();

    console.log('Sending order confirmation email:', {
      customerEmail,
      pixId,
      amount,
    });

    // Formata o valor
    const formattedAmount = `R$ ${(amount / 100).toFixed(2).replace('.', ',')}`;

    // Cria a lista de itens
    const itemsList = items
      .map(
        (item) =>
          `<li style="padding: 8px 0; border-bottom: 1px solid #eee;">
            <strong>${item.title}</strong> - Quantidade: ${item.quantity} - ${item.value}
          </li>`
      )
      .join('');

    // Email para o estabelecimento
    const adminEmailResponse = await resend.emails.send({
      from: 'Vincci Pub <onboarding@resend.dev>',
      to: ['joaovictor7398@gmail.com'],
      subject: `🎉 Novo Pedido Confirmado - ${pixId}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              }
              .header {
                background: linear-gradient(135deg, #FFD700, #FFB703);
                color: #000;
                padding: 30px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
              }
              .content {
                padding: 30px;
              }
              .info-section {
                background: #f9f9f9;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .info-section h2 {
                color: #FFD700;
                margin-top: 0;
                font-size: 20px;
              }
              .info-item {
                padding: 8px 0;
                border-bottom: 1px solid #ddd;
              }
              .info-item:last-child {
                border-bottom: none;
              }
              .info-item strong {
                color: #333;
              }
              ul {
                list-style: none;
                padding: 0;
              }
              .footer {
                background: #333;
                color: #fff;
                text-align: center;
                padding: 20px;
                font-size: 14px;
              }
              .status-badge {
                background: #28a745;
                color: white;
                padding: 6px 12px;
                border-radius: 20px;
                display: inline-block;
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✨ Novo Pedido Confirmado!</h1>
                <p style="margin: 10px 0 0 0;">Pagamento via PIX realizado com sucesso</p>
              </div>
              
              <div class="content">
                <p style="font-size: 16px;">
                  Um novo pedido foi confirmado e o pagamento foi recebido. Confira os detalhes abaixo:
                </p>

                <div class="info-section">
                  <h2>📋 Informações do Pedido</h2>
                  <div class="info-item">
                    <strong>ID do Pagamento:</strong> ${pixId}
                  </div>
                  <div class="info-item">
                    <strong>Valor Total:</strong> ${formattedAmount}
                  </div>
                  <div class="info-item">
                    <strong>Data/Hora:</strong> ${paymentDate}
                  </div>
                  <div class="info-item">
                    <strong>Status:</strong> <span class="status-badge">Pago</span>
                  </div>
                </div>

                <div class="info-section">
                  <h2>👤 Dados do Cliente</h2>
                  <div class="info-item">
                    <strong>Nome:</strong> ${customerName}
                  </div>
                  <div class="info-item">
                    <strong>Email:</strong> ${customerEmail}
                  </div>
                  <div class="info-item">
                    <strong>Telefone:</strong> ${customerPhone}
                  </div>
                  <div class="info-item">
                    <strong>CPF:</strong> ${customerTaxId}
                  </div>
                </div>

                <div class="info-section">
                  <h2>🍹 Itens do Pedido</h2>
                  <ul>
                    ${itemsList}
                  </ul>
                </div>

                <p style="margin-top: 30px; padding: 15px; background: #fff3cd; border-left: 4px solid #FFD700; border-radius: 4px;">
                  <strong>⚠️ Ação necessária:</strong> Entre em contato com o cliente para confirmar os detalhes do evento.
                </p>
              </div>

              <div class="footer">
                <p>Vincci Pub - Sistema de Pedidos</p>
                <p style="margin: 5px 0; font-size: 12px;">
                  Este é um email automático. Não responda a esta mensagem.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (adminEmailResponse.error) {
      console.error('Error sending admin email:', adminEmailResponse.error);
      throw adminEmailResponse.error;
    }

    // Email para o cliente
    const customerEmailResponse = await resend.emails.send({
      from: 'Vincci Pub <onboarding@resend.dev>',
      to: [customerEmail],
      subject: `✅ Pedido Confirmado - Vincci Pub`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              }
              .header {
                background: linear-gradient(135deg, #FFD700, #FFB703);
                color: #000;
                padding: 30px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
              }
              .content {
                padding: 30px;
              }
              .success-icon {
                text-align: center;
                font-size: 60px;
                margin: 20px 0;
              }
              .info-section {
                background: #f9f9f9;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .info-section h2 {
                color: #FFD700;
                margin-top: 0;
              }
              ul {
                list-style: none;
                padding: 0;
              }
              .footer {
                background: #333;
                color: #fff;
                text-align: center;
                padding: 20px;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Pagamento Confirmado!</h1>
              </div>
              
              <div class="content">
                <div class="success-icon">✅</div>
                
                <p style="font-size: 18px; text-align: center;">
                  Olá <strong>${customerName}</strong>!
                </p>
                
                <p style="text-align: center;">
                  Seu pagamento foi processado com sucesso! Obrigado pela sua compra.
                </p>

                <div class="info-section">
                  <h2>Detalhes do Pedido</h2>
                  <p><strong>ID do Pagamento:</strong> ${pixId}</p>
                  <p><strong>Valor Pago:</strong> ${formattedAmount}</p>
                  <p><strong>Data:</strong> ${paymentDate}</p>
                </div>

                <div class="info-section">
                  <h2>Próximos Passos</h2>
                  <ul style="line-height: 2;">
                    <li>📧 Você receberá mais informações por email</li>
                    <li>📱 Nossa equipe entrará em contato via WhatsApp</li>
                    <li>🍹 No dia do evento, estaremos prontos no horário combinado</li>
                  </ul>
                </div>

                <p style="text-align: center; margin-top: 30px; font-style: italic;">
                  Agradecemos pela confiança! Estamos ansiosos para tornar seu evento inesquecível! 🎉
                </p>
              </div>

              <div class="footer">
                <p><strong>Vincci Pub</strong></p>
                <p>Seu evento merece os melhores drinks!</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (customerEmailResponse.error) {
      console.error('Error sending customer email:', customerEmailResponse.error);
    }

    console.log('Emails sent successfully');

    return new Response(
      JSON.stringify({
        success: true,
        adminEmailId: adminEmailResponse.data?.id,
        customerEmailId: customerEmailResponse.data?.id,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error in send-order-confirmation function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});
