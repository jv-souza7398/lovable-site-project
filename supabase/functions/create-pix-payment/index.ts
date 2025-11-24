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
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, description, customerEmail, customerName, customerPhone, customerTaxId }: PaymentRequest = await req.json();
    
    console.log('Creating PIX payment:', { amount, description, customerEmail, customerName, customerPhone, customerTaxId });

    const abacatePayApiKey = Deno.env.get('ABACATEPAY_API_KEY');
    
    if (!abacatePayApiKey) {
      throw new Error('ABACATEPAY_API_KEY not configured');
    }

    // Criar cobrança PIX no AbacatePay
    const externalId = `order-${Date.now()}`;

    const payload = {
      frequency: 'ONE_TIME',
      methods: ['PIX'],
      products: [{
        externalId,
        name: description,
        description,
        quantity: 1,
        price: amount,
      }],
      returnUrl: `${req.headers.get('origin')}/billing`,
      completionUrl: `${req.headers.get('origin')}/completion`,
      customerId: externalId,
      customer: {
        name: customerName,
        cellphone: customerPhone,
        email: customerEmail,
        taxId: customerTaxId,
      },
      allowCoupons: false,
      coupons: [],
      externalId,
      metadata: {
        externalId,
      },
    };

    console.log('AbacatePay payload:', JSON.stringify(payload));

    const response = await fetch('https://api.abacatepay.com/v1/billing/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${abacatePayApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AbacatePay API error:', errorText);
      throw new Error(`AbacatePay API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('AbacatePay response:', data);

    return new Response(
      JSON.stringify({
        success: true,
        billingId: data.id,
        url: data.url,
        // AbacatePay retorna o link da página de pagamento
        // O PIX QR Code estará disponível nessa página
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
