import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple SHA-256 hash function for password
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, email, password, adminId, userData } = await req.json();

    if (action === "login") {
      // Hash the password
      const senhaHash = await hashPassword(password);

      // Verify credentials using the security definer function
      const { data, error } = await supabase.rpc("verify_admin_login", {
        _email: email,
        _senha_hash: senhaHash,
      });

      if (error) {
        console.error("Login error:", error);
        return new Response(
          JSON.stringify({ success: false, error: "Erro ao verificar credenciais" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      if (!data || data.length === 0) {
        return new Response(
          JSON.stringify({ success: false, error: "Email ou senha incorretos" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
        );
      }

      const admin = data[0];
      return new Response(
        JSON.stringify({
          success: true,
          admin: {
            id: admin.id,
            nome_completo: admin.nome_completo,
            email: admin.email,
            role: admin.role,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "get_admins") {
      // Verify the requesting admin is a manager
      const { data: requester, error: requesterError } = await supabase
        .from("admin_users")
        .select("role")
        .eq("id", adminId)
        .single();

      if (requesterError || !requester || requester.role !== "manager") {
        return new Response(
          JSON.stringify({ success: false, error: "Acesso negado" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
        );
      }

      const { data, error } = await supabase
        .from("admin_users")
        .select("id, nome_completo, cpf, email, role, created_at")
        .order("nome_completo");

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: "Erro ao carregar usuários" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ success: true, admins: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "create_admin") {
      // Verify the requesting admin is a manager
      const { data: requester, error: requesterError } = await supabase
        .from("admin_users")
        .select("role")
        .eq("id", adminId)
        .single();

      if (requesterError || !requester || requester.role !== "manager") {
        return new Response(
          JSON.stringify({ success: false, error: "Acesso negado" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
        );
      }

      // Check if email already exists
      const { data: existingEmail } = await supabase
        .from("admin_users")
        .select("id")
        .eq("email", userData.email)
        .single();

      if (existingEmail) {
        return new Response(
          JSON.stringify({ success: false, error: "Este email já está cadastrado" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Check if CPF already exists
      const { data: existingCpf } = await supabase
        .from("admin_users")
        .select("id")
        .eq("cpf", userData.cpf.replace(/\D/g, ""))
        .single();

      if (existingCpf) {
        return new Response(
          JSON.stringify({ success: false, error: "Este CPF já está cadastrado" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Hash password
      const senhaHash = await hashPassword(userData.password);

      // Create admin user
      const { data, error } = await supabase.from("admin_users").insert({
        nome_completo: userData.nome_completo,
        cpf: userData.cpf.replace(/\D/g, ""),
        email: userData.email,
        senha_hash: senhaHash,
        role: userData.role,
      }).select("id, nome_completo, cpf, email, role, created_at").single();

      if (error) {
        console.error("Create error:", error);
        return new Response(
          JSON.stringify({ success: false, error: "Erro ao criar usuário" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ success: true, admin: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "update_admin") {
      // Verify the requesting admin is a manager
      const { data: requester, error: requesterError } = await supabase
        .from("admin_users")
        .select("role")
        .eq("id", adminId)
        .single();

      if (requesterError || !requester || requester.role !== "manager") {
        return new Response(
          JSON.stringify({ success: false, error: "Acesso negado" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
        );
      }

      // Prevent manager from demoting themselves
      if (adminId === userData.id && userData.role !== "manager") {
        return new Response(
          JSON.stringify({ success: false, error: "Você não pode alterar sua própria role" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Build update object
      const updateData: Record<string, string> = {
        nome_completo: userData.nome_completo,
        cpf: userData.cpf.replace(/\D/g, ""),
        email: userData.email,
        role: userData.role,
      };

      // Only update password if provided
      if (userData.password) {
        updateData.senha_hash = await hashPassword(userData.password);
      }

      const { data, error } = await supabase
        .from("admin_users")
        .update(updateData)
        .eq("id", userData.id)
        .select("id, nome_completo, cpf, email, role, created_at")
        .single();

      if (error) {
        console.error("Update error:", error);
        return new Response(
          JSON.stringify({ success: false, error: "Erro ao atualizar usuário" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ success: true, admin: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "delete_admin") {
      // Verify the requesting admin is a manager
      const { data: requester, error: requesterError } = await supabase
        .from("admin_users")
        .select("role")
        .eq("id", adminId)
        .single();

      if (requesterError || !requester || requester.role !== "manager") {
        return new Response(
          JSON.stringify({ success: false, error: "Acesso negado" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
        );
      }

      // Prevent self-deletion
      if (adminId === userData.targetId) {
        return new Response(
          JSON.stringify({ success: false, error: "Você não pode excluir a si mesmo" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      const { error } = await supabase
        .from("admin_users")
        .delete()
        .eq("id", userData.targetId);

      if (error) {
        console.error("Delete error:", error);
        return new Response(
          JSON.stringify({ success: false, error: "Erro ao excluir usuário" }),
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