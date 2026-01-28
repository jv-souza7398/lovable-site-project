import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EventData {
  nomeCliente: string;
  telefone: string;
  tipoEvento: string;
  estimativaConvidados: number;
  dataEvento: string;
  horaInicio: string;
  cep: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
}

function formatarEndereco(data: EventData): string {
  const linha1 = data.complemento
    ? `Rua ${data.rua}, ${data.numero}, ${data.complemento}`
    : `Rua ${data.rua}, ${data.numero}`;
  const linha2 = `${data.bairro} - ${data.cidade}/${data.uf}`;
  const linha3 = `CEP: ${data.cep}`;
  return `${linha1}\n${linha2}\n${linha3}`;
}

function converterDataISO(dataEvento: string, horaInicio: string): string {
  // dataEvento pode vir como "2026-02-15" ou "15/02/2026"
  let ano: string, mes: string, dia: string;

  if (dataEvento.includes("-")) {
    // Formato YYYY-MM-DD
    [ano, mes, dia] = dataEvento.split("-");
  } else if (dataEvento.includes("/")) {
    // Formato DD/MM/YYYY
    [dia, mes, ano] = dataEvento.split("/");
  } else {
    // Fallback: usar data como está
    return `${dataEvento}T${horaInicio}:00.000Z`;
  }

  return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}T${horaInicio}:00.000Z`;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const NOTION_API_KEY = Deno.env.get("NOTION_API_KEY");
    const NOTION_DATABASE_ID = Deno.env.get("NOTION_DATABASE_ID");

    if (!NOTION_API_KEY) {
      throw new Error("NOTION_API_KEY não configurada");
    }

    if (!NOTION_DATABASE_ID) {
      throw new Error("NOTION_DATABASE_ID não configurada");
    }

    const data: EventData = await req.json();

    console.log("Dados recebidos:", JSON.stringify(data, null, 2));

    // Validar campos obrigatórios
    if (!data.nomeCliente || !data.dataEvento) {
      throw new Error("Campos obrigatórios ausentes: nomeCliente ou dataEvento");
    }

    // Formatar endereço completo
    const enderecoCompleto = formatarEndereco(data);

    // Converter data para ISO 8601
    const dataISO = converterDataISO(data.dataEvento, data.horaInicio || "00:00");

    // Criar página no Notion via API REST
    const notionResponse = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_API_KEY}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        parent: {
          database_id: NOTION_DATABASE_ID,
        },
        properties: {
          // Evento (Title) - formato "Evento - [Nome do Cliente]"
          Evento: {
            title: [
              {
                text: {
                  content: `Evento - ${data.nomeCliente}`,
                },
              },
            ],
          },
          // Tipo do evento (Rich Text)
          "Tipo do evento": {
            rich_text: [
              {
                text: {
                  content: data.tipoEvento || "Não informado",
                },
              },
            ],
          },
          // Média de pessoas (Number)
          "Média de pessoas": {
            number: parseInt(String(data.estimativaConvidados)) || 0,
          },
          // Data do evento (Date)
          "Data do evento": {
            date: {
              start: dataISO,
            },
          },
          // Endereço do evento (Place)
          "Endereço do evento": {
            place: {
              name: enderecoCompleto.replace(/\n/g, ", "),
            },
          },
          // Contratante (Rich Text)
          Contratante: {
            rich_text: [
              {
                text: {
                  content: data.nomeCliente,
                },
              },
            ],
          },
          // Contato contratante (Phone Number)
          "Contato contratante": {
            phone_number: data.telefone || "",
          },
        },
      }),
    });

    const responseData = await notionResponse.json();

    if (!notionResponse.ok) {
      console.error("Erro da API do Notion:", responseData);
      throw new Error(`Erro ao criar página no Notion: ${responseData.message || JSON.stringify(responseData)}`);
    }

    console.log("Página criada no Notion:", responseData.id);

    return new Response(
      JSON.stringify({
        success: true,
        pageId: responseData.id,
        message: "Página criada com sucesso no Notion",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Erro ao criar página no Notion:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
