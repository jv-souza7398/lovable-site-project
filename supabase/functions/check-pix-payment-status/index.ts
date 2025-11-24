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
    const { pixId } = await req.json();

    if (!pixId) {
      throw new Error('pixId is required');
    }

    const ABACATEPAY_API_KEY = Deno.env.get('ABACATEPAY_API_KEY');
    if (!ABACATEPAY_API_KEY) {
      throw new Error('ABACATEPAY_API_KEY not configured');
    }

    console.log('Checking PIX payment status for:', pixId);

    const response = await fetch(`https://api.abacatepay.com/v1/pixQrCode/check?id=${pixId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ABACATEPAY_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AbacatePay API error:', response.status, errorText);
      throw new Error(`AbacatePay API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('PIX payment check response:', data);

    const pixData = data.data ?? data;
    const status = pixData?.status;

    if (!status) {
      console.error('Status ausente na resposta:', data);
      throw new Error('Status ausente na resposta da API');
    }

    return new Response(
      JSON.stringify({
        success: true,
        status, // PAID, PENDING, EXPIRED, etc
        data: pixData
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

