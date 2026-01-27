import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, adminId, drinkData, drinkId } = await req.json();

    // Verify the requesting admin exists and can edit
    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("id, role")
      .eq("id", adminId)
      .single();

    if (adminError || !admin) {
      console.error("Admin verification failed:", adminError);
      return new Response(
        JSON.stringify({ success: false, error: "Acesso negado - Admin não encontrado" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    // Only manager and planner can edit drinks
    const canEdit = admin.role === "manager" || admin.role === "planner";
    if (!canEdit) {
      return new Response(
        JSON.stringify({ success: false, error: "Acesso negado - Permissão insuficiente" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    if (action === "create") {
      const { data, error } = await supabase
        .from("drinks")
        .insert(drinkData)
        .select()
        .single();

      if (error) {
        console.error("Create drink error:", error);
        return new Response(
          JSON.stringify({ success: false, error: "Erro ao criar drink" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ success: true, drink: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "update") {
      const { data, error } = await supabase
        .from("drinks")
        .update(drinkData)
        .eq("id", drinkId)
        .select()
        .single();

      if (error) {
        console.error("Update drink error:", error);
        return new Response(
          JSON.stringify({ success: false, error: "Erro ao atualizar drink" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ success: true, drink: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "delete") {
      const { error } = await supabase
        .from("drinks")
        .delete()
        .eq("id", drinkId);

      if (error) {
        console.error("Delete drink error:", error);
        return new Response(
          JSON.stringify({ success: false, error: "Erro ao excluir drink" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Ação inválida" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Erro interno do servidor" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
