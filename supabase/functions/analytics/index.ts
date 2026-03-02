import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  try {
    // POST: track events
    if (req.method === "POST") {
      const body = await req.json();
      const { type, device_fingerprint, user_agent, page_url, referrer, device_type, event_type, event_data } = body;

      if (type === "pageview") {
        const { error } = await supabase.from("analytics_pageviews").insert({
          device_fingerprint,
          user_agent,
          page_url,
          referrer,
          device_type,
        });
        if (error) throw error;
        return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (type === "event") {
        const { error } = await supabase.from("analytics_events").insert({
          device_fingerprint,
          event_type,
          event_data,
          page_url,
        });
        if (error) throw error;
        return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({ error: "Invalid type" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // GET: dashboard data (requires admin verification)
    if (req.method === "GET" && action === "dashboard") {
      const startDate = url.searchParams.get("start") || new Date(Date.now() - 7 * 86400000).toISOString();
      const endDate = url.searchParams.get("end") || new Date().toISOString();

      // Unique devices
      const { data: uniqueDevices } = await supabase
        .from("analytics_pageviews")
        .select("device_fingerprint")
        .gte("created_at", startDate)
        .lte("created_at", endDate);

      const uniqueCount = new Set((uniqueDevices || []).map((d: any) => d.device_fingerprint)).size;

      // Previous period for comparison
      const periodMs = new Date(endDate).getTime() - new Date(startDate).getTime();
      const prevStart = new Date(new Date(startDate).getTime() - periodMs).toISOString();
      const prevEnd = startDate;

      const { data: prevDevices } = await supabase
        .from("analytics_pageviews")
        .select("device_fingerprint")
        .gte("created_at", prevStart)
        .lte("created_at", prevEnd);

      const prevUniqueCount = new Set((prevDevices || []).map((d: any) => d.device_fingerprint)).size;

      // Total pageviews
      const { count: totalPageviews } = await supabase
        .from("analytics_pageviews")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startDate)
        .lte("created_at", endDate);

      const { count: prevPageviews } = await supabase
        .from("analytics_pageviews")
        .select("*", { count: "exact", head: true })
        .gte("created_at", prevStart)
        .lte("created_at", prevEnd);

      // Events by type
      const { data: events } = await supabase
        .from("analytics_events")
        .select("event_type, created_at")
        .gte("created_at", startDate)
        .lte("created_at", endDate);

      const { data: prevEvents } = await supabase
        .from("analytics_events")
        .select("event_type")
        .gte("created_at", prevStart)
        .lte("created_at", prevEnd);

      const eventCounts: Record<string, number> = {};
      const prevEventCounts: Record<string, number> = {};

      (events || []).forEach((e: any) => {
        eventCounts[e.event_type] = (eventCounts[e.event_type] || 0) + 1;
      });
      (prevEvents || []).forEach((e: any) => {
        prevEventCounts[e.event_type] = (prevEventCounts[e.event_type] || 0) + 1;
      });

      // Daily pageviews for chart
      const dailyPageviews: Record<string, number> = {};
      const { data: allPageviews } = await supabase
        .from("analytics_pageviews")
        .select("created_at")
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .order("created_at", { ascending: true });

      (allPageviews || []).forEach((pv: any) => {
        const day = new Date(pv.created_at).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
        dailyPageviews[day] = (dailyPageviews[day] || 0) + 1;
      });

      // Device type breakdown
      const { data: deviceTypes } = await supabase
        .from("analytics_pageviews")
        .select("device_type")
        .gte("created_at", startDate)
        .lte("created_at", endDate);

      const deviceBreakdown: Record<string, number> = {};
      (deviceTypes || []).forEach((d: any) => {
        const type = d.device_type || "unknown";
        deviceBreakdown[type] = (deviceBreakdown[type] || 0) + 1;
      });

      const result = {
        uniqueDevices: uniqueCount,
        prevUniqueDevices: prevUniqueCount,
        totalPageviews: totalPageviews || 0,
        prevPageviews: prevPageviews || 0,
        quoteSent: eventCounts["quote_sent"] || 0,
        prevQuoteSent: prevEventCounts["quote_sent"] || 0,
        checkoutStart: eventCounts["checkout_start"] || 0,
        prevCheckoutStart: prevEventCounts["checkout_start"] || 0,
        addToCart: eventCounts["add_to_cart"] || 0,
        viewCart: eventCounts["view_cart"] || 0,
        dailyPageviews: Object.entries(dailyPageviews).map(([date, count]) => ({ date, count })),
        deviceBreakdown: Object.entries(deviceBreakdown).map(([type, count]) => ({ type, count })),
        funnel: {
          pageviews: totalPageviews || 0,
          addToCart: eventCounts["add_to_cart"] || 0,
          viewCart: eventCounts["view_cart"] || 0,
          checkoutStart: eventCounts["checkout_start"] || 0,
          quoteSent: eventCounts["quote_sent"] || 0,
        },
      };

      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // GET: export CSV
    if (req.method === "GET" && action === "export") {
      const startDate = url.searchParams.get("start") || new Date(Date.now() - 30 * 86400000).toISOString();
      const endDate = url.searchParams.get("end") || new Date().toISOString();

      const { data: pageviews } = await supabase
        .from("analytics_pageviews")
        .select("*")
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .order("created_at", { ascending: false })
        .limit(5000);

      const { data: eventsData } = await supabase
        .from("analytics_events")
        .select("*")
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .order("created_at", { ascending: false })
        .limit(5000);

      let csv = "Tipo,Fingerprint,Página/Evento,Dispositivo,Data\n";
      (pageviews || []).forEach((pv: any) => {
        const date = new Date(pv.created_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
        csv += `Pageview,"${pv.device_fingerprint}","${pv.page_url}","${pv.device_type || ''}","${date}"\n`;
      });
      (eventsData || []).forEach((ev: any) => {
        const date = new Date(ev.created_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
        csv += `Evento,"${ev.device_fingerprint}","${ev.event_type}","","${date}"\n`;
      });

      return new Response(csv, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="analytics_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Analytics error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
