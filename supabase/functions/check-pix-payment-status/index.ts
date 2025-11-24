import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { billingId } = await req.json();

    if (!billingId) {
      throw new Error('billingId is required');
    }

    const ABACATEPAY_API_KEY = Deno.env.get('ABACATEPAY_API_KEY');
    if (!ABACATEPAY_API_KEY) {
      throw new Error('ABACATEPAY_API_KEY not configured');
    }

    console.log('Checking payment status for billing:', billingId);

    // Consulta a lista de pagamentos e filtra pelo billingId específico
    const response = await fetch('https://api.abacatepay.com/v1/billing/list', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ABACATEPAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AbacatePay API error:', response.status, errorText);
      throw new Error(`AbacatePay API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Billing list response:', data);

    // Procura o billing específico na lista
    const billing = data.data?.find((bill: any) => bill.id === billingId);

    if (!billing) {
      console.log('Billing not found in list');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Pagamento não encontrado',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    console.log('Payment status:', billing.status);

    return new Response(
      JSON.stringify({
        success: true,
        status: billing.status, // PAID, PENDING, CANCELLED, etc
        data: billing
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error checking payment status:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

