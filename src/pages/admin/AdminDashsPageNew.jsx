import React, { useState, useEffect, useCallback } from 'react';
import {
  Smartphone,
  Eye,
  FileText,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  Calendar,
  Monitor,
  Tablet,
  Loader2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const PERIODS = [
  { label: 'Hoje', value: 'today' },
  { label: '7 dias', value: '7d' },
  { label: '30 dias', value: '30d' },
  { label: 'Total', value: 'all' },
];

function getDateRange(period) {
  const now = new Date();
  const end = now.toISOString();
  let start;

  switch (period) {
    case 'today': {
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      start = todayStart.toISOString();
      break;
    }
    case '7d':
      start = new Date(now.getTime() - 7 * 86400000).toISOString();
      break;
    case '30d':
      start = new Date(now.getTime() - 30 * 86400000).toISOString();
      break;
    case 'all':
      start = new Date('2024-01-01').toISOString();
      break;
    default:
      start = new Date(now.getTime() - 7 * 86400000).toISOString();
  }

  return { start, end };
}

function calcChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

const PIE_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#71717a'];

const cardStyle = {
  backgroundColor: '#18181b',
  border: '1px solid #27272a',
  borderRadius: '0.75rem',
  padding: '1.25rem',
};

const labelStyle = {
  fontSize: '0.8rem',
  color: '#a1a1aa',
  margin: 0,
  fontWeight: 500,
  letterSpacing: '0.03em',
};

const bigNumStyle = {
  fontSize: '2rem',
  fontWeight: 700,
  color: 'white',
  margin: '0.25rem 0',
  lineHeight: 1.1,
};

function Badge({ value }) {
  const isPositive = value >= 0;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.2rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        padding: '0.15rem 0.5rem',
        borderRadius: '9999px',
        backgroundColor: isPositive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
        color: isPositive ? '#10b981' : '#ef4444',
        border: `1px solid ${isPositive ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
      }}
    >
      {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {isPositive ? '+' : ''}
      {value}%
    </span>
  );
}

function MetricCard({ icon: Icon, label, value, change, iconColor = '#f59e0b' }) {
  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={labelStyle}>{label}</p>
          <p style={bigNumStyle}>{typeof value === 'number' ? value.toLocaleString('pt-BR') : value}</p>
          {change !== undefined && <Badge value={change} />}
        </div>
        <div
          style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '0.75rem',
            backgroundColor: `${iconColor}15`,
            border: `1px solid ${iconColor}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={20} style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
}

function FunnelBar({ label, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>{label}</span>
        <span style={{ fontSize: '0.8rem', color: 'white', fontWeight: 600 }}>{value.toLocaleString('pt-BR')}</span>
      </div>
      <div style={{ backgroundColor: '#27272a', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: '4px',
            transition: 'width 0.5s ease',
          }}
        />
      </div>
    </div>
  );
}

const deviceIconMap = {
  mobile: Smartphone,
  desktop: Monitor,
  tablet: Tablet,
};

const chartTooltipStyle = {
  backgroundColor: '#18181b',
  border: '1px solid #27272a',
  borderRadius: '8px',
  fontSize: '0.8rem',
  color: '#a1a1aa',
};

export default function AdminDashsPageNew() {
  const [period, setPeriod] = useState('7d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { start, end } = getDateRange(period);
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analytics?action=dashboard&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
      const res = await fetch(url, {
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { start, end } = getDateRange(period);
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analytics?action=export&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
      const res = await fetch(url, {
        headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
      });
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `analytics_${period}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  const conversionRate = data && data.totalPageviews > 0
    ? ((data.quoteSent / data.totalPageviews) * 100).toFixed(1)
    : '0.0';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', margin: 0 }}>
            Monitoramento
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#71717a', margin: '0.25rem 0 0' }}>
            Métricas de uso do site em tempo real
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Period Selector */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#27272a',
              borderRadius: '0.5rem',
              overflow: 'hidden',
            }}
          >
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                style={{
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: period === p.value ? '#f59e0b' : 'transparent',
                  color: period === p.value ? '#000' : '#a1a1aa',
                  transition: 'all 0.2s',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button
            onClick={fetchData}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: '0.5rem',
              border: '1px solid #27272a',
              backgroundColor: '#18181b',
              color: '#a1a1aa',
              cursor: 'pointer',
            }}
            title="Atualizar"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          {/* Export */}
          <button
            onClick={handleExport}
            disabled={exporting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.75rem',
              fontSize: '0.8rem',
              fontWeight: 500,
              borderRadius: '0.5rem',
              border: '1px solid #27272a',
              backgroundColor: '#18181b',
              color: '#a1a1aa',
              cursor: 'pointer',
            }}
          >
            <Download size={14} />
            CSV
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && !data && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
          <Loader2 size={32} style={{ color: '#f59e0b', animation: 'spin 1s linear infinite' }} />
        </div>
      )}

      {data && (
        <>
          {/* Metric Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <MetricCard
              icon={Smartphone}
              label="Visitantes Únicos"
              value={data.uniqueDevices}
              change={calcChange(data.uniqueDevices, data.prevUniqueDevices)}
              iconColor="#3b82f6"
            />
            <MetricCard
              icon={Eye}
              label="Total de Acessos"
              value={data.totalPageviews}
              change={calcChange(data.totalPageviews, data.prevPageviews)}
              iconColor="#f59e0b"
            />
            <MetricCard
              icon={FileText}
              label="Orçamentos Realizados"
              value={data.quoteSent}
              change={calcChange(data.quoteSent, data.prevQuoteSent)}
              iconColor="#10b981"
            />
            <MetricCard
              icon={ShoppingCart}
              label="Chegaram ao Checkout"
              value={data.checkoutStart}
              change={calcChange(data.checkoutStart, data.prevCheckoutStart)}
              iconColor="#a855f7"
            />
          </div>

          {/* Charts Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            {/* Line Chart - Daily Pageviews */}
            <div style={{ ...cardStyle, minHeight: '280px' }}>
              <p style={{ ...labelStyle, marginBottom: '1rem' }}>Acessos Diários</p>
              {data.dailyPageviews.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={data.dailyPageviews}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ fill: '#f59e0b', r: 3 }}
                      name="Acessos"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ color: '#71717a', textAlign: 'center', paddingTop: '4rem', fontSize: '0.875rem' }}>
                  Sem dados no período
                </p>
              )}
            </div>

            {/* Pie Chart - Device Types */}
            <div style={{ ...cardStyle, minHeight: '280px' }}>
              <p style={{ ...labelStyle, marginBottom: '1rem' }}>Dispositivos</p>
              {data.deviceBreakdown.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <ResponsiveContainer width="55%" height={200}>
                    <PieChart>
                      <Pie
                        data={data.deviceBreakdown}
                        dataKey="count"
                        nameKey="type"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={45}
                      >
                        {data.deviceBreakdown.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={chartTooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {data.deviceBreakdown.map((d, i) => {
                      const Icon = deviceIconMap[d.type] || Monitor;
                      const total = data.deviceBreakdown.reduce((s, x) => s + x.count, 0);
                      const pct = total > 0 ? ((d.count / total) * 100).toFixed(0) : 0;
                      return (
                        <div key={d.type} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                            }}
                          />
                          <Icon size={14} style={{ color: '#a1a1aa' }} />
                          <span style={{ fontSize: '0.8rem', color: '#a1a1aa', textTransform: 'capitalize' }}>
                            {d.type} ({pct}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p style={{ color: '#71717a', textAlign: 'center', paddingTop: '4rem', fontSize: '0.875rem' }}>
                  Sem dados no período
                </p>
              )}
            </div>
          </div>

          {/* Funnel + Conversion */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1rem',
            }}
          >
            {/* Funnel */}
            <div style={cardStyle}>
              <p style={{ ...labelStyle, marginBottom: '1rem' }}>Funil de Conversão</p>
              <FunnelBar label="Acessos" value={data.funnel.pageviews} max={data.funnel.pageviews} color="#f59e0b" />
              <FunnelBar label="Adicionaram ao Carrinho" value={data.funnel.addToCart} max={data.funnel.pageviews} color="#3b82f6" />
              <FunnelBar label="Viram o Carrinho" value={data.funnel.viewCart} max={data.funnel.pageviews} color="#8b5cf6" />
              <FunnelBar label="Iniciaram Checkout" value={data.funnel.checkoutStart} max={data.funnel.pageviews} color="#a855f7" />
              <FunnelBar label="Enviaram Orçamento" value={data.funnel.quoteSent} max={data.funnel.pageviews} color="#10b981" />
            </div>

            {/* Conversion Rate */}
            <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <p style={labelStyle}>Taxa de Conversão</p>
              <p style={{ fontSize: '3rem', fontWeight: 700, color: '#10b981', margin: '0.5rem 0' }}>
                {conversionRate}%
              </p>
              <p style={{ fontSize: '0.8rem', color: '#71717a', textAlign: 'center', maxWidth: '16rem' }}>
                Proporção de visitantes que finalizaram um orçamento no período selecionado
              </p>
            </div>
          </div>
        </>
      )}

      {/* CSS for spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
