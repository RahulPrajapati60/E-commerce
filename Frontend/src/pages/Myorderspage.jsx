import { useState, useEffect } from "react";
import { orderAPI } from "../api/order";
import { useAuth } from "../context/AuthContext";

const fmt = (n) => "₹" + Math.round(Number(n)).toLocaleString("en-IN");

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:   { label: "Pending",   color: "bg-amber-50 text-amber-700 border-amber-200",   dot: "bg-amber-400"  },
  confirmed: { label: "Confirmed", color: "bg-blue-50 text-blue-700 border-blue-200",      dot: "bg-blue-500"   },
  packed:    { label: "Packed",    color: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-500" },
  shipped:   { label: "Shipped",   color: "bg-violet-50 text-violet-700 border-violet-200", dot: "bg-violet-500" },
  delivered: { label: "Delivered", color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", color: "bg-red-50 text-red-600 border-red-200",          dot: "bg-red-400"   },
  refunded:  { label: "Refunded",  color: "bg-stone-50 text-stone-600 border-stone-200",    dot: "bg-stone-400" },
};

const PAYMENT_STATUS_CONFIG = {
  paid:     { label: "Paid",     color: "text-emerald-600" },
  pending:  { label: "Pending",  color: "text-amber-600"   },
  failed:   { label: "Failed",   color: "text-red-500"     },
  refunded: { label: "Refunded", color: "text-stone-500"   },
};

const TIMELINE_STEPS = ["confirmed", "packed", "shipped", "delivered"];

// ── Helpers ───────────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const PaymentMethodIcon = ({ method }) => {
  const icons = {
    upi:        { label: "UPI",  bg: "bg-violet-100 text-violet-700" },
    card:       { label: "Card", bg: "bg-blue-100 text-blue-700"     },
    netbanking: { label: "Net",  bg: "bg-sky-100 text-sky-700"       },
    wallet:     { label: "Pay",  bg: "bg-teal-100 text-teal-700"     },
    cod:        { label: "COD",  bg: "bg-stone-100 text-stone-600"   },
  };
  const cfg = icons[method] || icons.cod;
  return (
    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${cfg.bg}`}>{cfg.label}</span>
  );
};

// ── Order timeline ─────────────────────────────────────────────────────────────
const OrderTimeline = ({ status }) => {
  const currentIdx = TIMELINE_STEPS.indexOf(status);
  const isCancelled = status === "cancelled" || status === "refunded";

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 py-3">
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-red-600">Order {status}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0 mt-4 mb-1">
      {TIMELINE_STEPS.map((step, i) => {
        const done    = i <= currentIdx;
        const active  = i === currentIdx;
        const icons   = ["✅", "📦", "🚚", "🏠"];
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm border-2 transition-all ${
                done
                  ? "border-amber-400 bg-amber-50"
                  : "border-stone-200 bg-stone-50"
              } ${active ? "shadow-md shadow-amber-100 scale-110" : ""}`}>
                <span className={done ? "" : "grayscale opacity-30"}>{icons[i]}</span>
              </div>
              <span className={`text-[9px] font-semibold mt-1 capitalize ${done ? "text-amber-700" : "text-stone-400"}`}>
                {step}
              </span>
            </div>
            {i < TIMELINE_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mb-4 mx-1 transition-all duration-500 ${i < currentIdx ? "bg-amber-400" : "bg-stone-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Order detail modal ────────────────────────────────────────────────────────
const OrderDetailModal = ({ order, onClose, onCancel, cancelling }) => {
  const cancellable = ["pending", "confirmed", "packed"].includes(order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white px-5 sm:px-6 py-4 border-b border-stone-100 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h2 className="text-base font-black text-stone-900">Order Details</h2>
            <p className="text-xs text-stone-400 font-mono mt-0.5">{order.orderId}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center transition-colors">
            <svg className="w-4 h-4 text-stone-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 sm:px-6 py-5 space-y-5">

          {/* Status + timeline */}
          <div className="bg-stone-50 border border-stone-100 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1">
              <StatusBadge status={order.status} />
              <span className="text-xs text-stone-400">
                {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
            <OrderTimeline status={order.status} />
            {order.estimatedDelivery && order.status !== "delivered" && order.status !== "cancelled" && (
              <p className="text-xs text-stone-500 mt-2 text-center">
                Expected by <span className="font-semibold text-stone-700">
                  {new Date(order.estimatedDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
                </span>
              </p>
            )}
          </div>

          {/* Items */}
          <div className="bg-white border border-stone-100 rounded-2xl overflow-hidden">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider px-4 py-3 border-b border-stone-50">
              Items ({order.items?.reduce((s, i) => s + i.qty, 0)})
            </p>
            <div className="divide-y divide-stone-50">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                    {item.img
                      ? <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-stone-300 text-lg">📦</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-900 truncate">{item.name}</p>
                    <p className="text-xs text-stone-400">{item.category} · Qty: {item.qty}</p>
                  </div>
                  <p className="text-sm font-black text-stone-900 flex-shrink-0">{fmt(item.price * item.qty)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Price breakdown */}
          <div className="bg-stone-50 border border-stone-100 rounded-2xl p-4 space-y-2 text-sm">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">Price Breakdown</p>
            <div className="flex justify-between text-stone-600"><span>Subtotal</span><span className="font-semibold text-stone-800">{fmt(order.subtotal)}</span></div>
            <div className="flex justify-between text-stone-600">
              <span>Shipping</span>
              <span className={`font-semibold ${order.shippingFee === 0 ? "text-emerald-600" : "text-stone-800"}`}>
                {order.shippingFee === 0 ? "Free" : fmt(order.shippingFee)}
              </span>
            </div>
            {order.couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Coupon {order.couponCode && `(${order.couponCode})`}</span>
                <span className="font-semibold">−{fmt(order.couponDiscount)}</span>
              </div>
            )}
            <div className="border-t border-stone-200 pt-2 flex justify-between font-black text-stone-900 text-base">
              <span>Total Paid</span><span>{fmt(order.total)}</span>
            </div>
          </div>

          {/* Payment info */}
          <div className="bg-white border border-stone-100 rounded-2xl p-4">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">Payment</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PaymentMethodIcon method={order.payment?.method} />
                <span className="text-sm font-semibold text-stone-700 capitalize">{order.payment?.method}</span>
                {order.payment?.upiId && <span className="text-xs text-stone-400">{order.payment.upiId}</span>}
                {order.payment?.cardLast4 && <span className="text-xs text-stone-400">•••• {order.payment.cardLast4}</span>}
                {order.payment?.bank && <span className="text-xs text-stone-400">{order.payment.bank}</span>}
              </div>
              <span className={`text-xs font-bold ${PAYMENT_STATUS_CONFIG[order.paymentStatus]?.color || "text-stone-500"}`}>
                {PAYMENT_STATUS_CONFIG[order.paymentStatus]?.label || order.paymentStatus}
              </span>
            </div>
          </div>

          {/* Delivery address */}
          <div className="bg-white border border-stone-100 rounded-2xl p-4">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">Delivery Address</p>
            <p className="text-sm font-bold text-stone-900">{order.deliveryAddress?.fullName}</p>
            <p className="text-sm text-stone-600 mt-0.5">
              {order.deliveryAddress?.address}
              {order.deliveryAddress?.locality ? `, ${order.deliveryAddress.locality}` : ""}
            </p>
            <p className="text-sm text-stone-600">
              {order.deliveryAddress?.city}, {order.deliveryAddress?.state} — {order.deliveryAddress?.pincode}
            </p>
            <p className="text-xs text-stone-400 mt-1">📱 +91 {order.deliveryAddress?.phone}</p>
          </div>

          {/* Cancel button */}
          {cancellable && (
            <button onClick={() => onCancel(order.orderId)} disabled={cancelling}
              className="w-full border-2 border-red-200 text-red-500 font-bold py-3 rounded-xl text-sm hover:bg-red-50 hover:border-red-300 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {cancelling && <span className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />}
              Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Order card ─────────────────────────────────────────────────────────────────
const OrderCard = ({ order, onClick }) => {
  const firstItem  = order.items?.[0];
  const totalItems = order.items?.reduce((s, i) => s + i.qty, 0) || 0;
  const date       = new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <button onClick={onClick}
      className="w-full bg-white rounded-2xl border border-stone-100 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-50 transition-all duration-200 p-4 text-left group">
      <div className="flex items-start gap-4">
        {/* First item image */}
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 relative">
          {firstItem?.img
            ? <img src={firstItem.img} alt={firstItem.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
          }
          {totalItems > 1 && (
            <span className="absolute bottom-0 right-0 bg-stone-900/80 text-white text-[9px] font-black px-1.5 py-0.5 rounded-tl-lg">
              +{totalItems - 1}
            </span>
          )}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm font-bold text-stone-900 truncate">{firstItem?.name || "Order"}</p>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-xs text-stone-400 font-mono mb-2">{order.orderId}</p>
          <div className="flex items-center gap-3 text-xs text-stone-500">
            <span>{totalItems} item{totalItems !== 1 ? "s" : ""}</span>
            <span className="text-stone-300">·</span>
            <PaymentMethodIcon method={order.payment?.method} />
            <span className="text-stone-300">·</span>
            <span>{date}</span>
          </div>
        </div>

        {/* Total + arrow */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <p className="text-base font-black text-stone-900">{fmt(order.total)}</p>
          <svg className="w-4 h-4 text-stone-300 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </div>

      {/* Delivered / estimated delivery footer */}
      {order.status === "delivered" && (
        <div className="mt-3 pt-3 border-t border-stone-50 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-semibold text-emerald-600">Delivered</span>
        </div>
      )}
      {order.status === "shipped" && order.estimatedDelivery && (
        <div className="mt-3 pt-3 border-t border-stone-50 flex items-center gap-1.5">
          <span className="text-xs">🚚</span>
          <span className="text-xs text-stone-500">Expected by{" "}
            <span className="font-semibold text-stone-700">
              {new Date(order.estimatedDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
          </span>
        </div>
      )}
    </button>
  );
};

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyOrders = ({ onNavigate }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="relative w-28 h-28 mb-6">
      <div className="w-28 h-28 bg-amber-50 rounded-full flex items-center justify-center">
        <svg className="w-14 h-14 text-amber-200" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
      </div>
      <div className="absolute -top-1 -right-1 w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center text-base">🛒</div>
    </div>
    <h2 className="text-xl font-black text-stone-900 mb-2">No orders yet</h2>
    <p className="text-stone-400 text-sm max-w-xs leading-relaxed mb-7">
      You haven't placed any orders. Explore our collection of authentic Indian crafts and handmade goods.
    </p>
    <button onClick={() => onNavigate("home")}
      className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold px-7 py-3.5 rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all active:scale-[0.98] shadow-lg shadow-amber-200">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
      </svg>
      Start Shopping
    </button>
  </div>
);

// ── Main MyOrdersPage ─────────────────────────────────────────────────────────
const MyOrdersPage = ({ onNavigate, onToast }) => {
  const { user, accessToken } = useAuth();
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [selected,   setSelected]   = useState(null);   
  const [cancelling, setCancelling] = useState(false);
  const [filter,     setFilter]     = useState("all");  

  useEffect(() => {
    if (!user) { onNavigate("login"); return; }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await orderAPI.getMyOrders(accessToken);
      setOrders(res.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    setCancelling(true);
    try {
      await orderAPI.cancelOrder(orderId, accessToken);
      onToast("Order cancelled successfully", "success");
      setSelected(null);
      fetchOrders();
    } catch (err) {
      onToast(err.message, "error");
    } finally {
      setCancelling(false);
    }
  };

  const FILTERS = [
    { id: "all",       label: "All Orders" },
    { id: "active",    label: "Active"     },
    { id: "delivered", label: "Delivered"  },
    { id: "cancelled", label: "Cancelled"  },
  ];

  const ACTIVE_STATUSES = ["pending", "confirmed", "packed", "shipped"];

  const filtered = orders.filter(o => {
    if (filter === "all")       return true;
    if (filter === "active")    return ACTIVE_STATUSES.includes(o.status);
    if (filter === "delivered") return o.status === "delivered";
    if (filter === "cancelled") return o.status === "cancelled" || o.status === "refunded";
    return true;
  });

  // Stats
  const totalSpent    = orders.filter(o => o.status !== "cancelled" && o.status !== "refunded").reduce((s, o) => s + o.total, 0);
  const activeOrders  = orders.filter(o => ACTIVE_STATUSES.includes(o.status)).length;
  const deliveredCnt  = orders.filter(o => o.status === "delivered").length;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => onNavigate("profile")}
            className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center hover:border-amber-300 hover:bg-amber-50 transition-colors group">
            <svg className="w-4 h-4 text-stone-500 group-hover:text-amber-700 group-hover:-translate-x-0.5 transition-all" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-black text-stone-900">My Orders</h1>
            <p className="text-stone-400 text-sm">{orders.length} total order{orders.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* Stats row */}
        {orders.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Total Spent", value: fmt(totalSpent),     color: "bg-amber-50 border-amber-100" },
              { label: "Active",      value: activeOrders,         color: "bg-blue-50 border-blue-100"   },
              { label: "Delivered",   value: deliveredCnt,         color: "bg-emerald-50 border-emerald-100" },
            ].map(s => (
              <div key={s.label} className={`rounded-2xl border p-4 text-center ${s.color}`}>
                <p className="text-xl font-black text-stone-900">{s.value}</p>
                <p className="text-xs text-stone-500 font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filter tabs */}
        {orders.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mb-5">
            {FILTERS.map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  filter === f.id
                    ? "bg-stone-900 text-white"
                    : "bg-white text-stone-600 border border-stone-200 hover:border-amber-300"
                }`}>
                {f.label}
                {f.id !== "all" && (
                  <span className={`ml-1.5 text-[10px] font-black ${filter === f.id ? "text-white/60" : "text-stone-400"}`}>
                    {f.id === "active"    ? activeOrders :
                     f.id === "delivered" ? deliveredCnt :
                     orders.filter(o => o.status === "cancelled" || o.status === "refunded").length}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-stone-100 p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-stone-100 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-stone-100 rounded w-3/4" />
                    <div className="h-3 bg-stone-100 rounded w-1/2" />
                    <div className="h-3 bg-stone-100 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-600 font-semibold text-sm mb-3">{error}</p>
            <button onClick={fetchOrders}
              className="bg-red-500 text-white font-bold px-5 py-2 rounded-xl text-sm hover:bg-red-600 transition-colors">
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <EmptyOrders onNavigate={onNavigate} />
        ) : filtered.length === 0 ? (
          <div className="text-center py-14">
            <p className="text-stone-400 font-semibold text-sm">No orders in this category</p>
            <button onClick={() => setFilter("all")} className="mt-3 text-amber-600 font-semibold text-sm hover:text-amber-700">
              View all orders
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(order => (
              <OrderCard
                key={order._id}
                order={order}
                onClick={() => setSelected(order)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <OrderDetailModal
          order={selected}
          onClose={() => setSelected(null)}
          onCancel={handleCancel}
          cancelling={cancelling}
        />
      )}
    </div>
  );
};

export default MyOrdersPage;