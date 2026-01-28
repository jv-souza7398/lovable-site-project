import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const GMAIL_CLIENT_ID = Deno.env.get("GMAIL_CLIENT_ID");
const GMAIL_CLIENT_SECRET = Deno.env.get("GMAIL_CLIENT_SECRET");
const GMAIL_REFRESH_TOKEN = Deno.env.get("GMAIL_REFRESH_TOKEN");
const GMAIL_USER_EMAIL = Deno.env.get("GMAIL_USER_EMAIL");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface VisitNotificationRequest {
  timestamp: string;
  userAgent: string;
  referrer: string;
  pagina: string;
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

// Create email in RFC 2822 format
function createEmail(to: string, subject: string, htmlContent: string): string {
  const email = [
    `From: Vincci Bar <${GMAIL_USER_EMAIL}>`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    btoa(unescape(encodeURIComponent(htmlContent))),
  ];

  return email.join("\r\n");
}

// Send email using Gmail API
async function sendGmailEmail(to: string, subject: string, htmlContent: string): Promise<any> {
  const accessToken = await getGmailAccessToken();
  const rawEmail = createEmail(to, subject, htmlContent);
  
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

// Parse user agent to get device/browser info
function parseUserAgent(ua: string): { device: string; browser: string } {
  let device = "Desktop";
  let browser = "Desconhecido";

  // Detect device
  if (/iPhone/i.test(ua)) {
    device = "Mobile (iPhone)";
  } else if (/iPad/i.test(ua)) {
    device = "Tablet (iPad)";
  } else if (/Android/i.test(ua)) {
    if (/Mobile/i.test(ua)) {
      device = "Mobile (Android)";
    } else {
      device = "Tablet (Android)";
    }
  } else if (/Windows Phone/i.test(ua)) {
    device = "Mobile (Windows Phone)";
  } else if (/Mac/i.test(ua)) {
    device = "Desktop (Mac)";
  } else if (/Windows/i.test(ua)) {
    device = "Desktop (Windows)";
  } else if (/Linux/i.test(ua)) {
    device = "Desktop (Linux)";
  }

  // Detect browser
  if (/Chrome/i.test(ua) && !/Edge|Edg/i.test(ua)) {
    const match = ua.match(/Chrome\/(\d+)/);
    browser = `Chrome ${match ? match[1] : ""}`;
  } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
    const match = ua.match(/Version\/(\d+)/);
    browser = `Safari ${match ? match[1] : ""}`;
  } else if (/Firefox/i.test(ua)) {
    const match = ua.match(/Firefox\/(\d+)/);
    browser = `Firefox ${match ? match[1] : ""}`;
  } else if (/Edge|Edg/i.test(ua)) {
    const match = ua.match(/(?:Edge|Edg)\/(\d+)/);
    browser = `Edge ${match ? match[1] : ""}`;
  } else if (/Opera|OPR/i.test(ua)) {
    browser = "Opera";
  }

  return { device, browser };
}

// Format referrer for display
function formatReferrer(referrer: string): string {
  if (!referrer || referrer === "Direto" || referrer === "") {
    return "Acesso Direto";
  }
  
  try {
    const url = new URL(referrer);
    const hostname = url.hostname;
    
    if (hostname.includes("google")) return "Google Search";
    if (hostname.includes("facebook")) return "Facebook";
    if (hostname.includes("instagram")) return "Instagram";
    if (hostname.includes("linkedin")) return "LinkedIn";
    if (hostname.includes("twitter") || hostname.includes("x.com")) return "Twitter/X";
    if (hostname.includes("whatsapp")) return "WhatsApp";
    
    return hostname;
  } catch {
    return referrer;
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const { timestamp, userAgent, referrer, pagina }: VisitNotificationRequest = await req.json();

    // Validate that this is from the home page
    if (pagina !== "home") {
      return new Response(JSON.stringify({ error: "Apenas notificações da home são aceitas" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get IP from headers
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
               req.headers.get("x-real-ip") || 
               "IP não disponível";

    // Parse user agent
    const { device, browser } = parseUserAgent(userAgent || "");
    
    // Format referrer
    const formattedReferrer = formatReferrer(referrer);
    
    // Format date/time in Brazilian format
    const visitDate = new Date(timestamp);
    const formattedDate = visitDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const formattedTime = visitDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #92753c 0%, #b8964a 100%); color: white; padding: 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 24px; }
          .info-row { display: flex; align-items: flex-start; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #eee; }
          .info-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
          .icon { font-size: 20px; margin-right: 12px; min-width: 24px; }
          .info-content { flex: 1; }
          .info-label { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
          .info-value { font-size: 15px; color: #333; }
          .footer { background: #f9f9f9; padding: 16px; text-align: center; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏠 Visita na Página Principal</h1>
          </div>
          <div class="content">
            <div class="info-row">
              <span class="icon">⏰</span>
              <div class="info-content">
                <div class="info-label">Data/Hora</div>
                <div class="info-value">${formattedDate} às ${formattedTime}</div>
              </div>
            </div>
            <div class="info-row">
              <span class="icon">📱</span>
              <div class="info-content">
                <div class="info-label">Dispositivo</div>
                <div class="info-value">${device}</div>
              </div>
            </div>
            <div class="info-row">
              <span class="icon">🌍</span>
              <div class="info-content">
                <div class="info-label">Navegador</div>
                <div class="info-value">${browser}</div>
              </div>
            </div>
            <div class="info-row">
              <span class="icon">📍</span>
              <div class="info-content">
                <div class="info-label">IP</div>
                <div class="info-value">${ip}</div>
              </div>
            </div>
            <div class="info-row">
              <span class="icon">🔗</span>
              <div class="info-content">
                <div class="info-label">Origem</div>
                <div class="info-value">${formattedReferrer}</div>
              </div>
            </div>
          </div>
          <div class="footer">
            Vincci Bar - Notificação Automática de Visita
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email notification
    const emailResponse = await sendGmailEmail(
      "joaovictor7398.2@gmail.com",
      "🏠 Nova visita na página inicial - Vincci Bar",
      emailHTML
    );

    console.log("Home visit notification sent:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in notify-home-visit function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
