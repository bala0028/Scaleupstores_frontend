import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dashboardService, settingsService } from "@/shared/api/services";
import type {
  DashboardSummary,
  SalesChartData,
  OrdersByStatusItem,
  TopProductItem,
  CustomerGrowthItem,
  HourlySalesItem,
  DayOfWeekSalesItem,
  TopCustomerItem,
  LowStockAlertItem,
  AttentionItems,
  OperationsInsights,
  CatalogInsights,
  EngagementInsights,
  DashboardSectionVisibility,
} from "@/shared/api/services/types";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
} from "recharts";
import {
  ArrowUpRightIcon,
  ChartBarIcon,
  CubeIcon,
  UsersIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CalendarDaysIcon,
  TagIcon,
  UserGroupIcon,
  ShoppingCartIcon,
  BanknotesIcon,
  TruckIcon,
  StarIcon,
  ArchiveBoxXMarkIcon,
  CreditCardIcon,
  MapPinIcon,
  CheckCircleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/solid";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const currencyFormatter = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(value) || 0);

const numberFormatter = (value: number) =>
  new Intl.NumberFormat("en-IN").format(Number(value) || 0);

const percentageFormatter = (value: number) => {
  if (value === 0) return "0%";
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
};

const COLORS = {
  primary: "#1c927f",
  secondary: "#3b82f6",
  warning: "#f59e0b",
  danger: "#ef4444",
  success: "#10b981",
  info: "#6366f1",
  chart: ["#1c927f", "#3b82f6", "#f59e0b", "#ef4444", "#10b981", "#6366f1", "#ec4899", "#06b6d4", "#84cc16", "#f97316"],
};

const STAT_GRADIENTS: Record<string, string> = {
  emerald: "from-emerald-600 via-emerald-500 to-teal-400",
  blue: "from-blue-600 via-blue-500 to-sky-400",
  purple: "from-purple-600 via-purple-500 to-violet-400",
  orange: "from-orange-500 via-amber-500 to-yellow-400",
  red: "from-rose-600 via-red-500 to-pink-400",
  green: "from-green-600 via-green-500 to-emerald-400",
};

const StatCard = ({ title, value, change, changeLabel, icon, gradient = "emerald", trend = "up", loading }: {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  gradient?: string;
  iconBg?: string;
  iconColor?: string;
  trend?: "up" | "down" | "neutral";
  loading?: boolean;
}) => {
  if (loading) {
    return (
      <Card className="border-none shadow-sm p-5 rounded-2xl h-full">
        <div className="flex items-start justify-between mb-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
        <Skeleton className="h-8 w-28 mb-2" />
        <Skeleton className="h-3 w-36" />
      </Card>
    );
  }

  const TrendIcon = trend === "up" ? ArrowTrendingUpIcon : trend === "down" ? ArrowTrendingDownIcon : ArrowPathIcon;
  const gradientClass = STAT_GRADIENTS[gradient] || STAT_GRADIENTS.emerald;

  return (
    <Card className={`relative overflow-hidden border-none shadow-lg rounded-2xl h-full bg-gradient-to-br ${gradientClass} group hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5`}>
      <div className="p-5 flex flex-col justify-between h-full relative z-10">
        <div className="flex items-start justify-between mb-4">
          <p className="text-sm font-medium text-white/80 tracking-wide">{title}</p>
          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 text-white/90">
            {icon}
          </div>
        </div>

        <p className="text-[1.75rem] font-bold text-white leading-tight mb-2 tracking-tight">{value}</p>

        {change !== undefined && change !== 0 && (
          <div className="flex items-center gap-1.5">
            <TrendIcon className="w-3.5 h-3.5 text-white/90" />
            <span className="text-xs font-semibold text-white/90">
              {percentageFormatter(change)}
            </span>
            <span className="text-xs text-white/60">{changeLabel || "vs last period"}</span>
          </div>
        )}
        {change !== undefined && change === 0 && (
          <div className="flex items-center gap-1.5">
            <ArrowPathIcon className="w-3.5 h-3.5 text-white/70" />
            <span className="text-xs font-semibold text-white/70">No change</span>
            <span className="text-xs text-white/50">{changeLabel || "vs last period"}</span>
          </div>
        )}
        {change === undefined && changeLabel && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-white/60">{changeLabel}</span>
          </div>
        )}
      </div>

      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/[0.06]" />
      <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/[0.04]" />
    </Card>
  );
};

const ChartCard = ({ title, subtitle, children, action, className = "" }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) => (
  <Card className={`border-none shadow-sm p-6 rounded-2xl ${className}`}>
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
    <div className="h-64">{children}</div>
  </Card>
);

/** Small secondary metric card — for callouts that don't need a full gradient StatCard. */
const MiniStat = ({ label, value, subLabel, icon, tone = "neutral", loading }: {
  label: string;
  value: string | number;
  subLabel?: string;
  icon: React.ReactNode;
  tone?: "neutral" | "warning" | "danger" | "success";
  loading?: boolean;
}) => {
  const toneClasses: Record<string, string> = {
    neutral: "bg-gray-100 text-gray-600",
    warning: "bg-amber-50 text-amber-600",
    danger: "bg-red-50 text-red-600",
    success: "bg-emerald-50 text-emerald-600",
  };

  if (loading) {
    return (
      <Card className="border-none shadow-sm rounded-2xl p-4">
        <Skeleton className="h-4 w-20 mb-3" />
        <Skeleton className="h-7 w-16" />
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm rounded-2xl p-4">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 truncate">{label}</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
          {subLabel && <p className="text-xs text-gray-400 mt-0.5 truncate">{subLabel}</p>}
        </div>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${toneClasses[tone]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

/** A single item in the "Needs Attention" strip. Hidden entirely when count is 0. */
const AttentionChip = ({ count, label, to, tone }: { count: number; label: string; to: string; tone: "danger" | "warning" }) => {
  if (count === 0) return null;
  const toneClasses = tone === "danger" ? "bg-red-50 border-red-100 text-red-700" : "bg-amber-50 border-amber-100 text-amber-700";
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border ${toneClasses} hover:shadow-sm transition-shadow flex-shrink-0`}
    >
      <span className="text-sm font-bold">{count}</span>
      <span className="text-xs font-medium whitespace-nowrap">{label}</span>
      <ArrowUpRightIcon className="w-3 h-3 opacity-60" />
    </Link>
  );
};

/** Horizontal bar showing count of reviews at each star rating. */
const RatingDistributionBar = ({ distribution, total }: { distribution: Record<string, number>; total: number }) => (
  <div className="space-y-2">
    {[5, 4, 3, 2, 1].map((star) => {
      const count = distribution[String(star)] || 0;
      const pct = total > 0 ? (count / total) * 100 : 0;
      return (
        <div key={star} className="flex items-center gap-2 text-sm">
          <span className="flex items-center gap-0.5 w-10 flex-shrink-0 text-gray-600">
            {star} <StarIcon className="w-3.5 h-3.5 text-amber-400" />
          </span>
          <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
          </div>
          <span className="w-8 text-right text-xs text-gray-500 flex-shrink-0">{count}</span>
        </div>
      );
    })}
  </div>
);

const FUNNEL_STAGES = [
  { key: "pending", label: "Pending" },
  { key: "order_confirmed", label: "Confirmed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

const Home = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [salesChart, setSalesChart] = useState<SalesChartData["chartData"]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<OrdersByStatusItem[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductItem[]>([]);
  const [customerGrowth, setCustomerGrowth] = useState<CustomerGrowthItem[]>([]);
  const [hourlySales, setHourlySales] = useState<HourlySalesItem[]>([]);
  const [dayOfWeekSales, setDayOfWeekSales] = useState<DayOfWeekSalesItem[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomerItem[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlertItem[]>([]);
  const [attention, setAttention] = useState<AttentionItems | null>(null);
  const [operations, setOperations] = useState<OperationsInsights | null>(null);
  const [catalog, setCatalog] = useState<CatalogInsights | null>(null);
  const [engagement, setEngagement] = useState<EngagementInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [sectionVisibility, setSectionVisibility] = useState<DashboardSectionVisibility>({
    needsAttention: true,
    sales: true,
    fulfillment: true,
    inventory: true,
    customers: true,
  });

  useEffect(() => {
    settingsService.admin
      .getDashboardSections()
      .then((res: any) => {
        const data = res.data?.data || res.data;
        if (data) setSectionVisibility((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {
        /* keep defaults (all visible) if this fails */
      });
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          summaryRes,
          salesChartRes,
          ordersByStatusRes,
          topProductsRes,
          customerGrowthRes,
          hourlySalesRes,
          dayOfWeekSalesRes,
          topCustomersRes,
          lowStockAlertsRes,
          attentionRes,
          operationsRes,
          catalogRes,
          engagementRes,
        ] = await Promise.all([
          dashboardService.admin.getSummary(),
          dashboardService.admin.getSalesChart(timeRange),
          dashboardService.admin.getOrdersByStatus(),
          dashboardService.admin.getTopProducts(10),
          dashboardService.admin.getCustomerGrowth(12),
          dashboardService.admin.getHourlySales(),
          dashboardService.admin.getDayOfWeekSales(),
          dashboardService.admin.getTopCustomers(10),
          dashboardService.admin.getLowStockAlerts(5),
          dashboardService.admin.getAttentionItems(),
          dashboardService.admin.getOperationsInsights(timeRange),
          dashboardService.admin.getCatalogInsights(timeRange),
          dashboardService.admin.getEngagementInsights(timeRange),
        ]);

        if (summaryRes.data?.status && summaryRes.data.data) setSummary(summaryRes.data.data);
        if (salesChartRes.data?.status && salesChartRes.data.data) setSalesChart(salesChartRes.data.data.chartData || []);
        if (ordersByStatusRes.data?.status && ordersByStatusRes.data.data) setOrdersByStatus(ordersByStatusRes.data.data);
        if (topProductsRes.data?.status && topProductsRes.data.data) setTopProducts(topProductsRes.data.data);
        if (customerGrowthRes.data?.status && customerGrowthRes.data.data) setCustomerGrowth(customerGrowthRes.data.data);
        if (hourlySalesRes.data?.status && hourlySalesRes.data.data) setHourlySales(hourlySalesRes.data.data);
        if (dayOfWeekSalesRes.data?.status && dayOfWeekSalesRes.data.data) setDayOfWeekSales(dayOfWeekSalesRes.data.data);
        if (topCustomersRes.data?.status && topCustomersRes.data.data) setTopCustomers(topCustomersRes.data.data);
        if (lowStockAlertsRes.data?.status && lowStockAlertsRes.data.data) setLowStockAlerts(lowStockAlertsRes.data.data);
        if (attentionRes.data?.status && attentionRes.data.data) setAttention(attentionRes.data.data);
        if (operationsRes.data?.status && operationsRes.data.data) setOperations(operationsRes.data.data);
        if (catalogRes.data?.status && catalogRes.data.data) setCatalog(catalogRes.data.data);
        if (engagementRes.data?.status && engagementRes.data.data) setEngagement(engagementRes.data.data);
      } catch (err) {
        console.error("Error fetching dashboard:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-4 text-red-400" />
        <p className="text-lg">{error}</p>
      </div>
    );
  }

  const totalCustomers = summary?.total_customers ?? 0;
  const totalOrders = summary?.total_orders ?? 0;
  const totalRevenue = summary?.total_revenue ?? 0;
  const avgOrderValue = summary?.avg_order_value ?? 0;
  const pendingOrders = summary?.pending_orders ?? 0;
  const newCustomersThisWeek = summary?.new_customers_this_week ?? 0;
  const newCustomersLastWeek = summary?.new_customers_last_week ?? 0;
  const revenueChangePct = summary?.revenue_change_pct ?? 0;
  const todayOrders = summary?.today_orders ?? 0;
  const yesterdayOrders = summary?.yesterday_orders ?? 0;

  const customerChange = newCustomersLastWeek > 0
    ? ((newCustomersThisWeek - newCustomersLastWeek) / newCustomersLastWeek) * 100
    : 0;

  const recentOrders = summary?.recent_orders || [];
  const ordersByStatusData = ordersByStatus.length > 0 ? ordersByStatus : (summary?.orders_by_status ? Object.entries(summary.orders_by_status).map(([status, count]) => ({ status, count })) : []);
  const lowStockProducts = lowStockAlerts.length > 0 ? lowStockAlerts : (summary?.low_stock_products || []);

  const statusCountMap = Object.fromEntries(ordersByStatusData.map((s) => [s.status, s.count]));
  const funnelData = FUNNEL_STAGES.map((stage) => ({ label: stage.label, count: statusCountMap[stage.key] || 0 }));
  const cancelledCount = statusCountMap["cancelled"] || 0;
  const returnedCount = statusCountMap["returned"] || 0;

  const hasAttentionItems = attention && (
    attention.pending_orders_overdue > 0 ||
    attention.failed_payments > 0 ||
    attention.cod_pending_confirmation > 0 ||
    attention.unprinted_labels > 0 ||
    attention.unapproved_reviews > 0
  );

  return (
    <div className="p-1 md:p-1 lg:p-2 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your store.</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
              <CalendarDaysIcon className="w-4 h-4" />
              {timeRange} Days
              <ArrowPathIcon className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => setTimeRange(7)}
              className={`flex items-center justify-between px-3 py-2 text-sm ${timeRange === 7 ? "bg-primary-50 text-primary-600" : "text-gray-700 hover:bg-gray-50"}`}
            >
              Last 7 Days
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTimeRange(30)}
              className={`flex items-center justify-between px-3 py-2 text-sm ${timeRange === 30 ? "bg-primary-50 text-primary-600" : "text-gray-700 hover:bg-gray-50"}`}
            >
              Last 30 Days
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTimeRange(90)}
              className={`flex items-center justify-between px-3 py-2 text-sm ${timeRange === 90 ? "bg-primary-50 text-primary-600" : "text-gray-700 hover:bg-gray-50"}`}
            >
              Last 90 Days
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Needs Attention strip */}
      {sectionVisibility.needsAttention && attention && (
        <div className="flex items-center gap-3 flex-wrap">
          {hasAttentionItems ? (
            <>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex-shrink-0">Needs attention</span>
              <AttentionChip count={attention.pending_orders_overdue} label="orders pending 24h+" to="/dashboard/orders" tone="danger" />
              <AttentionChip count={attention.failed_payments} label="failed payments" to="/dashboard/orders" tone="danger" />
              <AttentionChip count={attention.cod_pending_confirmation} label="COD awaiting confirmation" to="/dashboard/orders" tone="warning" />
              <AttentionChip count={attention.unprinted_labels} label="unprinted labels" to="/dashboard/print_address" tone="warning" />
              <AttentionChip count={attention.unapproved_reviews} label="reviews pending approval" to="/dashboard/review" tone="warning" />
            </>
          ) : (
            <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
              <CheckCircleIcon className="w-4 h-4" />
              All clear — nothing needs your attention right now.
            </div>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Revenue"
          value={currencyFormatter(totalRevenue)}
          change={revenueChangePct}
          changeLabel="vs yesterday"
          icon={<CurrencyDollarIcon className="w-5 h-5" />}
          gradient="emerald"
          trend={revenueChangePct >= 0 ? "up" : "down"}
          loading={!summary}
        />
        <StatCard
          title="Today's Orders"
          value={numberFormatter(todayOrders)}
          change={yesterdayOrders > 0 ? ((todayOrders - yesterdayOrders) / yesterdayOrders) * 100 : undefined}
          changeLabel="vs yesterday"
          icon={<ShoppingBagIcon className="w-5 h-5" />}
          gradient="blue"
          trend={todayOrders >= yesterdayOrders ? "up" : "down"}
          loading={!summary}
        />
        <StatCard
          title="Total Customers"
          value={numberFormatter(totalCustomers)}
          change={customerChange}
          changeLabel="vs last week"
          icon={<UsersIcon className="w-5 h-5" />}
          gradient="purple"
          trend={customerChange >= 0 ? "up" : "down"}
          loading={!summary}
        />
        <StatCard
          title="Avg Order Value"
          value={currencyFormatter(avgOrderValue)}
          icon={<ChartBarIcon className="w-5 h-5" />}
          gradient="orange"
          loading={!summary}
        />
        <StatCard
          title="Pending Orders"
          value={numberFormatter(pendingOrders)}
          changeLabel={pendingOrders > 0 ? "needs attention" : "all clear"}
          icon={<ClockIcon className="w-5 h-5" />}
          gradient={pendingOrders > 0 ? "red" : "green"}
          loading={!summary}
        />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {sectionVisibility.sales && <TabsTrigger value="sales">Sales &amp; Products</TabsTrigger>}
          {sectionVisibility.fulfillment && (
            <TabsTrigger value="fulfillment">Fulfillment &amp; Logistics</TabsTrigger>
          )}
          {sectionVisibility.inventory && <TabsTrigger value="inventory">Inventory</TabsTrigger>}
          {sectionVisibility.customers && (
            <TabsTrigger value="customers">Customers &amp; Marketing</TabsTrigger>
          )}
        </TabsList>

        {/* ─── Overview ─────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8">
              <ChartCard
                title="Sales Overview"
                subtitle={`Last ${timeRange} days${salesChart.length > 0 ? ` • Peak: ${(() => { const m = Math.max(...salesChart.map(c => c.sales)); const f = salesChart.find(d => d.sales === m); return f ? f.date : "N/A"; })()}` : ""}`}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesChart.length ? salesChart : [{ date: "No data", sales: 0 }]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} dy={10} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9ca3af", fontSize: 11 }}
                      tickFormatter={(v) => v >= 100000 ? `${(v/100000).toFixed(1)}L` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}
                      dx={-10}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: "10px", border: "1px solid #374151", backgroundColor: "#1f2937", color: "#fff", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}
                      labelStyle={{ color: "#9ca3af", fontWeight: 500 }}
                      formatter={(value: any) => [currencyFormatter(Number(value) || 0), "Revenue"]}
                    />
                    <Area type="monotone" dataKey="sales" stroke={COLORS.primary} strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            <div className="lg:col-span-4">
              <ChartCard title="Orders by Status" subtitle={`${ordersByStatusData.reduce((sum, s) => sum + (s.count || 0), 0)} total orders`}>
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={ordersByStatusData.length ? ordersByStatusData : [{ status: "No data", count: 1 }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="count"
                      nameKey="status"
                      label={({ name, value, percent }) => `${name}: ${value} (${((percent || 0) * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {ordersByStatusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: "10px", border: "1px solid #374151", backgroundColor: "#1f2937", color: "#fff" }}
                      formatter={(value: any) => [numberFormatter(Number(value) || 0), "Orders"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-3 flex flex-wrap gap-2 justify-center">
                  {ordersByStatusData.map((item, index) => (
                    <Badge
                      key={item.status}
                      variant="secondary"
                      className="gap-1 px-2 py-1"
                      style={{ backgroundColor: `${COLORS.chart[index % COLORS.chart.length]}20`, color: COLORS.chart[index % COLORS.chart.length] }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.chart[index % COLORS.chart.length] }} />
                      {item.status}: {item.count}
                    </Badge>
                  ))}
                </div>
              </ChartCard>
            </div>
          </div>

          <Card className="border-none shadow-sm rounded-2xl p-4">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
              <p className="text-sm text-emerald-600 mt-0.5">Latest 10 orders</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-3 font-medium text-gray-500">Order</th>
                    <th className="text-left py-3 px-3 font-medium text-gray-500">Customer</th>
                    <th className="text-center py-3 px-3 font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-3 font-medium text-gray-500">Date</th>
                    <th className="text-right py-3 px-3 font-medium text-gray-500">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order: any, index: number) => {
                      const status = order.orderStatus || order.order_status || "pending";
                      const statusConfig = getStatusConfig(status);
                      return (
                        <tr key={order.id || index} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-medium text-gray-900">#{order.orderNumber || order.order_number || order.id}</div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-medium text-gray-900">{order.customer?.fullName || order.customer?.full_name || "Guest"}</div>
                            <div className="text-xs text-gray-500">{order.customer?.email || ""}</div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <Badge variant={statusConfig.variant} className="px-2 py-1">
                              {status}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 text-gray-500">
                            {order.createdAt ? format(new Date(order.createdAt), "MMM dd, yyyy") : order.created_at ? format(new Date(order.created_at), "MMM dd, yyyy") : "N/A"}
                          </td>
                          <td className="py-3 px-3 text-right font-semibold text-gray-900">
                            {currencyFormatter(order.totalAmount ?? order.total_amount ?? 0)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">
                        <ShoppingCartIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No recent orders</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ─── Sales & Products ─────────────────────────────────── */}
        {sectionVisibility.sales && (
        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5">
              <ChartCard title="Top Selling Products" subtitle="By quantity sold">
                <div className="space-y-4">
                  {(topProducts.length ? topProducts.slice(0, 5) : []).map((product, index) => (
                    <div key={product.product_id} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-gray-600">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.product_name}</p>
                        <p className="text-xs text-gray-500">{numberFormatter(product.total_sold)} sold • {currencyFormatter(product.total_revenue)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{currencyFormatter(product.total_revenue)}</p>
                      </div>
                    </div>
                  ))}
                  {topProducts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingBagIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No sales data available</p>
                    </div>
                  )}
                </div>
              </ChartCard>
            </div>

            <div className="lg:col-span-7">
              <ChartCard title="Top Customers by Spend" subtitle="Highest lifetime value customers">
                <div className="space-y-3">
                  {(topCustomers.length ? topCustomers.slice(0, 5) : []).map((customer, index) => (
                    <div key={customer.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary-600">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{customer.name}</p>
                        <p className="text-xs text-gray-500">{customer.email || customer.phone || "No contact"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{currencyFormatter(customer.total_spent)}</p>
                        <p className="text-xs text-gray-500">{customer.total_orders} orders</p>
                      </div>
                    </div>
                  ))}
                  {topCustomers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <UserGroupIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No customer data available</p>
                    </div>
                  )}
                </div>
              </ChartCard>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7">
              <ChartCard title="Category Performance" subtitle="Revenue, units sold and avg. rating by category">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={catalog?.category_performance.length ? catalog.category_performance : [{ category: "No data", revenue: 0 }]} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <XAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} type="number" tickFormatter={(v) => v >= 100000 ? `${(v/100000).toFixed(1)}L` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                    <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} width={80} />
                    <Tooltip
                      contentStyle={{ borderRadius: "10px", border: "1px solid #374151", backgroundColor: "#1f2937", color: "#fff" }}
                      formatter={(value: any) => [currencyFormatter(Number(value) || 0), "Revenue"]}
                    />
                    <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={30}>
                      {(catalog?.category_performance || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
              {catalog && catalog.category_performance.length > 0 && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {catalog.category_performance.map((cat) => (
                    <div key={cat.category} className="flex items-center justify-between bg-white rounded-xl px-4 py-2 text-sm shadow-sm">
                      <span className="font-medium text-gray-700">{cat.category}</span>
                      <span className="text-gray-500">{cat.units_sold} sold{cat.avg_rating != null ? ` • ${cat.avg_rating}★` : ""}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-5">
              <ChartCard title="Today's Hourly Sales" subtitle="Orders and revenue by hour">
                <div className="h-64 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 px-3 font-medium text-gray-500">Hour</th>
                        <th className="text-right py-2 px-3 font-medium text-gray-500">Orders</th>
                        <th className="text-right py-2 px-3 font-medium text-gray-500">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hourlySales.map((hour, index) => (
                        <tr key={hour.hour} className={`border-b border-gray-50 ${index % 2 === 0 ? "bg-gray-50/50" : ""}`}>
                          <td className="py-2 px-3 text-gray-600 font-medium">{hour.hour.toString().padStart(2, "0")}:00</td>
                          <td className="py-2 px-3 text-right text-gray-900">{hour.orders}</td>
                          <td className="py-2 px-3 text-right text-gray-900">{currencyFormatter(hour.revenue)}</td>
                        </tr>
                      ))}
                      {hourlySales.length === 0 && (
                        <tr>
                          <td colSpan={3} className="text-center py-8 text-gray-500">
                            <ClockIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p>No sales data for today</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </ChartCard>
            </div>
          </div>

          <ChartCard title="Day of Week Sales (30 days)" subtitle="Orders and revenue by weekday">
            <ResponsiveContainer width="100%" height="90%">
              <ComposedChart data={dayOfWeekSales.length ? dayOfWeekSales : [{ day: "No data", dayIndex: 0, orders: 0, revenue: 0 }]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} orientation="left" tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} dx={-10} />
                <YAxis yAxisId="right" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} orientation="right" tickFormatter={(v) => v >= 100000 ? `${(v/100000).toFixed(1)}L` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} dx={10} />
                <Tooltip
                  contentStyle={{ borderRadius: "10px", border: "1px solid #374151", backgroundColor: "#1f2937", color: "#fff" }}
                  formatter={(value: any, name?: any) => [String(name) === "revenue" ? currencyFormatter(Number(value) || 0) : numberFormatter(Number(value) || 0), String(name) === "revenue" ? "Revenue" : "Orders"]}
                />
                <Bar dataKey="orders" yAxisId="left" barSize={25} radius={[4, 4, 0, 0]} fill={COLORS.secondary} fillOpacity={0.8} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, strokeWidth: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.secondary, opacity: 0.8 }} />
                <span className="text-gray-600">Orders</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.primary }} />
                <span className="text-gray-600">Revenue</span>
              </div>
            </div>
          </ChartCard>
        </TabsContent>
        )}

        {/* ─── Fulfillment & Logistics ──────────────────────────── */}
        {sectionVisibility.fulfillment && (
        <TabsContent value="fulfillment" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MiniStat
              label="COD Orders"
              value={numberFormatter(operations?.payment.cod_count ?? 0)}
              subLabel={currencyFormatter(operations?.payment.cod_revenue ?? 0)}
              icon={<BanknotesIcon className="w-4 h-4" />}
              loading={!operations}
            />
            <MiniStat
              label="Online Orders"
              value={numberFormatter(operations?.payment.online_count ?? 0)}
              subLabel={currencyFormatter(operations?.payment.online_revenue ?? 0)}
              icon={<CreditCardIcon className="w-4 h-4" />}
              loading={!operations}
            />
            <MiniStat
              label="Payment Failure Rate"
              value={`${operations?.payment.payment_failure_rate ?? 0}%`}
              subLabel={`over last ${timeRange} days`}
              icon={<ExclamationTriangleIcon className="w-4 h-4" />}
              tone={(operations?.payment.payment_failure_rate ?? 0) > 5 ? "danger" : "neutral"}
              loading={!operations}
            />
            <MiniStat
              label="Avg Delivery Time"
              value={`${operations?.payment.avg_delivery_days ?? 0}d`}
              subLabel="order → delivered"
              icon={<TruckIcon className="w-4 h-4" />}
              loading={!operations}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7">
              <ChartCard title="Fulfillment Funnel" subtitle="Where orders currently stand in the pipeline">
                <div className="space-y-3 h-full flex flex-col justify-center">
                  {funnelData.map((stage, i) => {
                    const max = Math.max(...funnelData.map((s) => s.count), 1);
                    const pct = (stage.count / max) * 100;
                    return (
                      <div key={stage.label} className="flex items-center gap-3">
                        <span className="w-24 text-sm text-gray-600 flex-shrink-0">{stage.label}</span>
                        <div className="flex-1 h-6 rounded-lg bg-gray-100 overflow-hidden">
                          <div
                            className="h-full rounded-lg flex items-center justify-end px-2 text-xs text-white font-semibold"
                            style={{ width: `${Math.max(pct, stage.count > 0 ? 8 : 0)}%`, backgroundColor: COLORS.chart[i % COLORS.chart.length] }}
                          >
                            {stage.count > 0 && stage.count}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {(cancelledCount > 0 || returnedCount > 0) && (
                    <div className="flex items-center gap-4 pt-2 mt-2 border-t border-gray-100 text-xs text-gray-500">
                      {cancelledCount > 0 && <span>{cancelledCount} cancelled</span>}
                      {returnedCount > 0 && <span>{returnedCount} returned</span>}
                    </div>
                  )}
                </div>
              </ChartCard>
            </div>

            <div className="lg:col-span-5">
              <ChartCard title="Shipping Cost Ratio" subtitle={`Last ${timeRange} days`}>
                <div className="h-full flex flex-col justify-center gap-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-gray-900">{operations?.logistics.shipping_cost_ratio_pct ?? 0}%</p>
                    <p className="text-sm text-gray-500 mt-1">of revenue spent on shipping</p>
                  </div>
                  <div className="flex justify-around text-sm text-center">
                    <div>
                      <p className="text-gray-400 text-xs">Shipping Cost</p>
                      <p className="font-semibold text-gray-900">{currencyFormatter(operations?.logistics.total_shipping_cost ?? 0)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Revenue</p>
                      <p className="font-semibold text-gray-900">{currencyFormatter(operations?.logistics.total_revenue ?? 0)}</p>
                    </div>
                  </div>
                </div>
              </ChartCard>
            </div>
          </div>

          <ChartCard title="Orders by State" subtitle={`Top states by order volume, last ${timeRange} days`}>
            <div className="h-64 overflow-y-auto space-y-2 pr-1">
              {(operations?.logistics.by_state || []).map((s) => {
                const max = Math.max(...(operations?.logistics.by_state.map((x) => x.orders) || [1]), 1);
                return (
                  <div key={s.state} className="flex items-center gap-3">
                    <span className="w-28 text-sm text-gray-600 flex items-center gap-1 flex-shrink-0 truncate">
                      <MapPinIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" /> {s.state}
                    </span>
                    <div className="flex-1 h-5 rounded-lg bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-lg bg-primary-500" style={{ width: `${(s.orders / max) * 100}%`, backgroundColor: COLORS.primary }} />
                    </div>
                    <span className="w-16 text-right text-xs text-gray-500 flex-shrink-0">{s.orders} orders</span>
                    <span className="w-24 text-right text-xs text-gray-400 flex-shrink-0">{currencyFormatter(s.revenue)}</span>
                  </div>
                );
              })}
              {(!operations || operations.logistics.by_state.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <MapPinIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p>No order data for this period</p>
                </div>
              )}
            </div>
          </ChartCard>
        </TabsContent>
        )}

        {/* ─── Inventory ────────────────────────────────────────── */}
        {sectionVisibility.inventory && (
        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MiniStat
              label="Out of Stock"
              value={numberFormatter(catalog?.inventory.out_of_stock_count ?? 0)}
              subLabel="products, 0 units left"
              icon={<ArchiveBoxXMarkIcon className="w-4 h-4" />}
              tone={(catalog?.inventory.out_of_stock_count ?? 0) > 0 ? "danger" : "success"}
              loading={!catalog}
            />
            <MiniStat
              label="Dead Stock"
              value={numberFormatter(catalog?.inventory.dead_stock_count ?? 0)}
              subLabel={`no sales in ${timeRange} days`}
              icon={<CubeIcon className="w-4 h-4" />}
              tone={(catalog?.inventory.dead_stock_count ?? 0) > 0 ? "warning" : "success"}
              loading={!catalog}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6">
              <Card className="border-none shadow-sm rounded-2xl p-4 h-[420px] flex flex-col">
                <div className="mb-4 flex-shrink-0">
                  <h3 className="text-lg font-bold text-gray-900">Low Stock Alerts</h3>
                  <p className="text-sm text-emerald-600 mt-0.5">
                    {lowStockProducts.length > 0
                      ? `${lowStockProducts.length} product${lowStockProducts.length > 1 ? "s" : ""} need restocking`
                      : "All products well stocked"}
                  </p>
                </div>
                <div className="space-y-0 flex-1 overflow-y-auto pr-1">
                  {lowStockProducts.length > 0 ? (
                    lowStockProducts.slice(0, 10).map((product: any, idx: number) => (
                      <div key={product.id}>
                        <div className="flex items-center gap-3 py-3.5">
                          <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {product.image ? (
                              <img src={product.image} alt={product.product_name} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              <CubeIcon className="w-6 h-6 text-gray-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{product.product_name}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${product.is_critical ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${product.is_critical ? "bg-red-500" : "bg-amber-500"}`} />
                                {product.is_critical ? "Out of Stock" : "Low Stock"}
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-gray-900">{currencyFormatter(product.price)}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{product.stock_quantity} units left</p>
                          </div>
                        </div>
                        {idx < lowStockProducts.slice(0, 10).length - 1 && <div className="border-b border-gray-100" />}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-3 text-green-300" />
                      <p className="text-green-600 font-medium">All products well stocked!</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <div className="lg:col-span-6">
              <Card className="border-none shadow-sm rounded-2xl p-4 h-[420px] flex flex-col">
                <div className="mb-4 flex-shrink-0">
                  <h3 className="text-lg font-bold text-gray-900">Dead Stock</h3>
                  <p className="text-sm text-gray-500 mt-0.5">In stock but no sales in the last {timeRange} days</p>
                </div>
                <div className="space-y-0 flex-1 overflow-y-auto pr-1">
                  {(catalog?.inventory.dead_stock_products.length ?? 0) > 0 ? (
                    catalog!.inventory.dead_stock_products.map((product, idx) => (
                      <div key={product.id}>
                        <div className="flex items-center gap-3 py-3.5">
                          <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                            <CubeIcon className="w-5 h-5 text-gray-300" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{product.product_name}</p>
                            <p className="text-xs text-gray-400">{product.stock_quantity} units in stock</p>
                          </div>
                          <p className="text-sm font-bold text-gray-900 flex-shrink-0">{currencyFormatter(product.price)}</p>
                        </div>
                        {idx < catalog!.inventory.dead_stock_products.length - 1 && <div className="border-b border-gray-100" />}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      <CheckCircleIcon className="w-12 h-12 mx-auto mb-3 text-green-300" />
                      <p className="text-green-600 font-medium">Everything in stock is selling!</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
        )}

        {/* ─── Customers & Marketing ────────────────────────────── */}
        {sectionVisibility.customers && (
        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MiniStat
              label="Repeat Customer Rate"
              value={`${operations?.repeat_customers.repeat_rate_pct ?? 0}%`}
              subLabel={`${operations?.repeat_customers.repeat_customers ?? 0} of ${operations?.repeat_customers.total_customers_with_orders ?? 0} customers`}
              icon={<UserGroupIcon className="w-4 h-4" />}
              tone="success"
              loading={!operations}
            />
            <MiniStat
              label="Average Rating"
              value={engagement?.reviews.avg_rating ? `${engagement.reviews.avg_rating} ★` : "—"}
              subLabel={`${engagement?.reviews.total_reviews ?? 0} approved reviews`}
              icon={<StarIcon className="w-4 h-4" />}
              loading={!engagement}
            />
            <MiniStat
              label="Reviews Pending Approval"
              value={numberFormatter(engagement?.reviews.pending_approval_count ?? 0)}
              icon={<DocumentTextIcon className="w-4 h-4" />}
              tone={(engagement?.reviews.pending_approval_count ?? 0) > 0 ? "warning" : "success"}
              loading={!engagement}
            />
            <MiniStat
              label="Active Offers"
              value={numberFormatter(engagement?.offers.active_offers.length ?? 0)}
              subLabel={currencyFormatter(engagement?.offers.revenue_from_offered_products ?? 0) + " attributed"}
              icon={<TagIcon className="w-4 h-4" />}
              loading={!engagement}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7">
              <ChartCard title="Customer Growth" subtitle="Cumulative sign-ups over 12 months">
                <ResponsiveContainer width="100%" height="90%">
                  <LineChart data={customerGrowth.length ? customerGrowth : [{ month: "No data", new_customers: 0, cumulative_customers: 0 }]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} dx={-10} />
                    <Tooltip
                      contentStyle={{ borderRadius: "10px", border: "1px solid #374151", backgroundColor: "#1f2937", color: "#fff" }}
                      formatter={(value: any, name?: any) => [String(name) === "cumulative_customers" ? numberFormatter(Number(value) || 0) : String(Number(value) || 0), String(name) === "cumulative_customers" ? "Total Customers" : "New Customers"]}
                    />
                    <Line type="monotone" dataKey="cumulative_customers" stroke={COLORS.primary} strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="new_customers" stroke={COLORS.secondary} strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.primary }} />
                    <span className="text-gray-600">Total Customers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.secondary }} />
                    <span className="text-gray-600">New/Month</span>
                  </div>
                </div>
              </ChartCard>
            </div>

            <div className="lg:col-span-5">
              <ChartCard title="Rating Distribution" subtitle="Approved reviews by star rating">
                <RatingDistributionBar
                  distribution={engagement?.reviews.rating_distribution || {}}
                  total={engagement?.reviews.total_reviews || 0}
                />
              </ChartCard>
            </div>
          </div>

          <Card className="border-none shadow-sm rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Active Offers</h3>
                <p className="text-sm text-gray-500 mt-1">Currently running discounts and their attributed revenue</p>
              </div>
              <Badge variant="secondary" className="px-3 py-1">
                {currencyFormatter(engagement?.offers.revenue_from_offered_products ?? 0)} attributed
              </Badge>
            </div>
            <div className="space-y-2">
              {(engagement?.offers.active_offers.length ?? 0) > 0 ? (
                engagement!.offers.active_offers.map((offer) => (
                  <div key={offer.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{offer.offer_name}</p>
                      <p className="text-xs text-gray-500">
                        {offer.product || offer.category || "Store-wide"} • ends {format(new Date(offer.end_date), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-transparent">{offer.offer_percentage}% off</Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TagIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No active offers right now</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

function getStatusConfig(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "delivered" || normalized === "completed") return { variant: "default" as const, label: "Delivered" };
  if (normalized === "shipped" || normalized === "out_for_delivery") return { variant: "default" as const, label: "Shipped" };
  if (normalized === "pending" || normalized === "confirmed" || normalized === "order_confirmed") return { variant: "secondary" as const, label: "Pending" };
  if (normalized === "cancelled") return { variant: "destructive" as const, label: "Cancelled" };
  if (normalized === "returned" || normalized === "refunded") return { variant: "outline" as const, label: "Returned" };
  return { variant: "secondary" as const, label: status };
}

export default Home;
