import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { orderAPI } from "../api/order";
import Button from "../components/Button";

const ProfilePage = ({ onNavigate, onToast }) => {
  const { user, accessToken, logout } = useAuth();
  const [orderStats, setOrderStats] = useState({ total: 0, spent: 0, active: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await orderAPI.getMyOrders(accessToken);
        const orders = res.orders || [];
        const active  = orders.filter(o => ["pending","confirmed","packed","shipped"].includes(o.status)).length;
        const spent   = orders.filter(o => o.status !== "cancelled" && o.status !== "refunded").reduce((s,o) => s + o.total, 0);
        setOrderStats({ total: orders.length, spent, active });
      } catch (_) {}
      finally { setStatsLoading(false); }
    })();
  }, []);

  if (!user) { onNavigate("login"); return null; }

  const handleLogout = async () => {
    try {
      const { authAPI } = await import("../api/auth");
      await authAPI.logout(accessToken);
    } catch (_) {}
    logout();
    onToast("See you again!", "info");
    onNavigate("home");
  };

  const fields = [
    { label: "First Name",    value: user.firstName },
    { label: "Last Name",     value: user.lastName  },
    { label: "Email",         value: user.email     },
    { label: "Role",          value: user.role      },
    { label: "Verified",      value: user.isVarified ? "Yes ✓" : "Not yet" },
    { label: "Member Since",  value: user.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-IN", { year:"numeric", month:"long", day:"numeric" })
        : "—"
    },
  ];

  const fmt = (n) => n >= 1000 ? `₹${(n/1000).toFixed(1)}K` : `₹${Math.round(n)}`;

  const stats = [
    { n: statsLoading ? "—" : orderStats.total,             l: "Orders",   onClick: () => onNavigate("my-orders") },
    { n: statsLoading ? "—" : fmt(orderStats.spent),        l: "Spent",    onClick: null },
    { n: statsLoading ? "—" : orderStats.active,            l: "Active",   onClick: () => onNavigate("my-orders") },
    { n: user.role === "admin" ? "Admin" : "Member",        l: "Status",   onClick: null },
  ];

  const quickActions = [
    {
      icon: (
        <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"/>
        </svg>
      ),
      bg: "bg-amber-100 group-hover:bg-amber-200",
      border: "hover:border-amber-300 hover:bg-amber-50/30",
      title: "My Orders",
      sub: orderStats.active > 0 ? `${orderStats.active} active order${orderStats.active > 1 ? "s" : ""}` : "View order history",
      onClick: () => onNavigate("my-orders"),
      show: true,
    },
    {
      icon: (
        <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
        </svg>
      ),
      bg: "bg-blue-100 group-hover:bg-blue-200",
      border: "hover:border-blue-300 hover:bg-blue-50/30",
      title: "Change Password",
      sub: "Update your credentials",
      onClick: () => onNavigate("forgot-password"),
      show: true,
    },
    {
      icon: (
        <svg className="w-4 h-4 text-purple-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
        </svg>
      ),
      bg: "bg-purple-100 group-hover:bg-purple-200",
      border: "hover:border-purple-300 hover:bg-purple-50/30",
      title: "Admin Panel",
      sub: "Manage products & users",
      onClick: () => onNavigate("admin"),
      show: user.role === "admin",
    },
  ].filter(a => a.show);

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Header card */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-3xl p-8 mb-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-16"/>
          <div className="absolute right-0 bottom-0 w-40 h-40 bg-white/5 rounded-full translate-y-16"/>
          <div className="relative flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur border-2 border-white/30 flex items-center justify-center text-white text-3xl font-black flex-shrink-0">
              {user.firstName?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/70 text-sm font-medium mb-0.5">Welcome back</p>
              <h1 className="text-white font-black text-2xl">{user.firstName} {user.lastName}</h1>
              <p className="text-white/70 text-sm mt-0.5 truncate">{user.email}</p>
            </div>
            {/* Orders quick badge */}
            {!statsLoading && orderStats.active > 0 && (
              <button onClick={() => onNavigate("my-orders")}
                className="flex-shrink-0 bg-white/20 backdrop-blur hover:bg-white/30 transition-colors rounded-2xl px-4 py-3 text-center">
                <p className="text-white font-black text-xl leading-none">{orderStats.active}</p>
                <p className="text-white/70 text-[10px] font-semibold mt-0.5">Active</p>
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {stats.map(s => (
            <button key={s.l}
              onClick={s.onClick || undefined}
              className={`bg-white rounded-2xl p-4 text-center border border-stone-100 transition-colors ${s.onClick ? "hover:border-amber-200 cursor-pointer" : "cursor-default"}`}>
              <p className={`text-xl font-black text-stone-900 ${statsLoading ? "animate-pulse" : ""}`}>{s.n}</p>
              <p className="text-xs text-stone-400 mt-0.5">{s.l}</p>
            </button>
          ))}
        </div>

        {/* Quick actions */}
        <div className={`grid gap-3 mb-6 ${quickActions.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
          {quickActions.map(a => (
            <button key={a.title} onClick={a.onClick}
              className={`bg-white border border-stone-200 rounded-2xl p-4 text-left transition-all group ${a.border}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-colors ${a.bg}`}>
                {a.icon}
              </div>
              <p className="font-bold text-sm text-stone-900">{a.title}</p>
              <p className="text-xs text-stone-400 mt-0.5">{a.sub}</p>
            </button>
          ))}
        </div>

        {/* Account details */}
        <div className="bg-white rounded-3xl border border-stone-100 overflow-hidden mb-4">
          <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
            <h2 className="font-bold text-stone-900">Account Details</h2>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-amber-100 text-amber-700"}`}>
              {user.role}
            </span>
          </div>
          <div className="divide-y divide-stone-50">
            {fields.map(f => (
              <div key={f.label} className="flex items-center justify-between px-6 py-4 hover:bg-stone-50/50 transition-colors">
                <span className="text-sm text-stone-500 font-medium">{f.label}</span>
                <span className="text-sm text-stone-900 font-semibold">{f.value || "—"}</span>
              </div>
            ))}
          </div>
        </div>

        <Button variant="outline" onClick={handleLogout} className="w-full border-red-200 text-red-500 hover:bg-red-50">
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;