import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  amount: number;
  description: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  customerTaxId: string;
  expiresIn?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, description, customerEmail, customerName, customerPhone, customerTaxId, expiresIn }: PaymentRequest = await req.json();
    
    console.log('Creating PIX QR Code:', { amount, description, customerEmail, customerName, customerPhone, customerTaxId });

    const abacatePayApiKey = Deno.env.get('ABACATEPAY_API_KEY');
    
    if (!abacatePayApiKey) {
      throw new Error('ABACATEPAY_API_KEY not configured');
    }

    const externalId = `order-${Date.now()}`;

    const pixQrCodePayload = {
      amount,
      expiresIn: expiresIn || 3600, // 1 hora por padrão
      description,
      customer: {
        name: customerName,
        cellphone: customerPhone,
        email: customerEmail,
        taxId: customerTaxId,
      },
      metadata: {
        externalId,
      },
    };

    console.log('AbacatePay PIX QR Code payload:', JSON.stringify(pixQrCodePayload));

    const response = await fetch('https://api.abacatepay.com/v1/pixQrCode/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${abacatePayApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pixQrCodePayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AbacatePay API error:', errorText);
      throw new Error(`AbacatePay API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('AbacatePay PIX QR Code response:', data);

    const pixData = data.data ?? data;
    const pixId = pixData?.id;
    const qrCodeImageUrl = pixData?.qrCodeImage;
    const pixCopyPaste = pixData?.qrCode;

    if (!pixId || !qrCodeImageUrl || !pixCopyPaste) {
      console.error('AbacatePay dados do PIX ausentes na resposta:', data);
      throw new Error('AbacatePay dados do PIX ausentes na resposta da API');
    }

    return new Response(
      JSON.stringify({
        success: true,
        pixId,
        qrCodeImageUrl,
        pixCopyPaste,
        expiresAt: pixData?.expiresAt,
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
    console.error('Error in create-pix-payment function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
});
