import { useState } from "react";


const COUPONS = {
  UTSAV10:  { type: "percent", value: 10,   label: "10% off" },
  FIRST15:  { type: "percent", value: 15,   label: "15% off on first order" },
  FLAT500:  { type: "flat",    value: 500,  label: "₹500 flat off" },
  FESTIVE:  { type: "percent", value: 20,   label: "20% festive discount" },
};

const SHIPPING_THRESHOLD = 999;   
const SHIPPING_CHARGE    = 99;


const fmt = (n) =>
  "₹" + Math.round(n).toLocaleString("en-IN");

// ── Sub-components ─────────────────────────────────────────────────────────────

const EmptyCart = ({ onNavigate }) => (
  <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
    <div className="relative mb-8">
      <div className="w-32 h-32 bg-amber-50 rounded-full flex items-center justify-center">
        <svg
          className="w-16 h-16 text-amber-300"
          fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
          />
        </svg>
      </div>
      {/* Decorative dots */}
      <div className="absolute top-2 right-0 w-4 h-4 bg-amber-200 rounded-full" />
      <div className="absolute bottom-4 left-0 w-3 h-3 bg-orange-200 rounded-full" />
    </div>
    <h2 className="text-2xl font-black text-stone-900 mb-2">Your cart is empty</h2>
    <p className="text-stone-500 text-sm max-w-xs leading-relaxed mb-8">
      Looks like you haven't added anything yet. Explore our collection of authentic Indian crafts.
    </p>
    <button
      onClick={() => onNavigate("home")}
      className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold px-8 py-3.5 rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all active:scale-[0.98] shadow-lg shadow-amber-200"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
      </svg>
      Continue Shopping
    </button>
  </div>
);

const CartItem = ({ item, onRemove, onUpdateQty }) => {
  const [removing, setRemoving] = useState(false);

  const handleRemove = () => {
    setRemoving(true);
    setTimeout(() => onRemove(item.id), 280);
  };

  const saving = item.originalPrice
    ? (item.originalPrice - item.price) * item.qty
    : 0;

  return (
    <div
      className={`flex gap-4 py-5 transition-all duration-300 ${
        removing ? "opacity-0 -translate-x-4" : "opacity-100 translate-x-0"
      }`}
    >
      {/* Thumbnail */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-100">
        <img
          src={item.img}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-widest uppercase text-amber-600 mb-0.5">
              {item.category} · {item.region}
            </p>
            <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-snug truncate">
              {item.name}
            </h3>
          </div>
          {/* Remove button */}
          <button
            onClick={handleRemove}
            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-stone-300 hover:text-red-400 hover:bg-red-50 transition-colors"
            title="Remove item"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Price row */}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-base font-black text-stone-900">{fmt(item.price)}</span>
          {item.originalPrice && (
            <span className="text-xs text-stone-400 line-through">{fmt(item.originalPrice)}</span>
          )}
          {saving > 0 && (
            <span className="text-xs font-semibold text-emerald-600">
              Save {fmt(saving)}
            </span>
          )}
        </div>

        {/* Qty stepper */}
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-xl p-1">
            <button
              onClick={() => onUpdateQty(item.id, item.qty - 1)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-500 hover:bg-white hover:text-stone-900 hover:shadow-sm transition-all font-bold text-lg leading-none"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-bold text-stone-900">
              {item.qty}
            </span>
            <button
              onClick={() => onUpdateQty(item.id, item.qty + 1)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-500 hover:bg-white hover:text-stone-900 hover:shadow-sm transition-all font-bold text-lg leading-none"
            >
              +
            </button>
          </div>
          <span className="text-xs text-stone-400">
            Subtotal:{" "}
            <span className="font-bold text-stone-700">{fmt(item.price * item.qty)}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

const CouponInput = ({ onApply, applied, onRemove }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleApply = () => {
    const upper = code.trim().toUpperCase();
    if (!upper) { setError("Enter a coupon code"); return; }
    if (COUPONS[upper]) {
      onApply(upper, COUPONS[upper]);
      setError("");
      setCode("");
    } else {
      setError("Invalid coupon code");
    }
  };

  if (applied) {
    return (
      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <span className="text-sm font-bold text-emerald-800">{applied.code}</span>
            <span className="text-xs text-emerald-600 ml-2">— {applied.label}</span>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="text-xs text-emerald-600 font-semibold hover:text-emerald-800 transition-colors"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
          placeholder="Enter coupon code"
          className={`flex-1 px-4 py-3 text-sm border rounded-xl bg-stone-50 focus:outline-none focus:ring-2 transition-all font-mono tracking-wider
            ${error ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-stone-200 focus:border-amber-400 focus:ring-amber-100"}`}
        />
        <button
          onClick={handleApply}
          className="px-5 py-3 bg-stone-900 text-white text-sm font-bold rounded-xl hover:bg-amber-700 transition-colors active:scale-[0.98] flex-shrink-0"
        >
          Apply
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
      <div className="flex flex-wrap gap-2 mt-3">
        {Object.entries(COUPONS).map(([code, info]) => (
          <button
            key={code}
            onClick={() => { onApply(code, info); }}
            className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-lg hover:bg-amber-100 transition-colors font-mono tracking-wider"
          >
            {code}
          </button>
        ))}
      </div>
    </div>
  );
};

// ── Main CartPage ─────────────────────────────────────────────────────────────

const CartPage = ({ onNavigate, onToast, cart, onRemove, onUpdateQty, onClearCart, coupon, onCouponChange }) => {
  const setCoupon   = onCouponChange;   
  const [ordered]   = useState(false);  

  const subtotal  = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const totalSaving = cart.reduce(
    (sum, i) => sum + (i.originalPrice ? (i.originalPrice - i.price) * i.qty : 0),
    0
  );
  const shippingFee = subtotal >= SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_CHARGE;

  const couponDiscount = (() => {
    if (!coupon) return 0;
    if (coupon.type === "percent") return Math.round((subtotal * coupon.value) / 100);
    return Math.min(coupon.value, subtotal);
  })();

  const total = subtotal + shippingFee - couponDiscount;
  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);

  const handleApplyCoupon = (code, info) => {
    setCoupon({ ...info, code });
    onToast(`Coupon "${code}" applied — ${info.label}!`, "success");
  };

  const handleCheckout = () => {
    onNavigate("payment");
  };

  // ── Empty cart ────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => onNavigate("home")}
              className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center hover:border-amber-300 hover:bg-amber-50 transition-colors group"
            >
              <svg className="w-4 h-4 text-stone-500 group-hover:text-amber-700 group-hover:-translate-x-0.5 transition-all" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-black text-stone-900">Shopping Cart</h1>
          </div>
          <EmptyCart onNavigate={onNavigate} />
        </div>
      </div>
    );
  }

  // ── Main cart UI ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => onNavigate("home")}
            className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center hover:border-amber-300 hover:bg-amber-50 transition-colors group"
          >
            <svg className="w-4 h-4 text-stone-500 group-hover:text-amber-700 group-hover:-translate-x-0.5 transition-all" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-black text-stone-900 leading-tight">Shopping Cart</h1>
            <p className="text-stone-400 text-sm">{totalItems} item{totalItems !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={() => { onClearCart(); setCoupon(null); onToast("Cart cleared", "info"); }}
            className="ml-auto text-xs text-stone-400 hover:text-red-500 font-semibold transition-colors"
          >
            Clear all
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

          {/* ── Left: Cart items ── */}
          <div>
            {/* Free shipping progress */}
            {subtotal < SHIPPING_THRESHOLD && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-amber-800">
                    Add{" "}
                    <span className="font-black">{fmt(SHIPPING_THRESHOLD - subtotal)}</span>{" "}
                    more for free shipping 🚚
                  </p>
                  <span className="text-xs text-amber-600 font-bold">
                    {Math.round((subtotal / SHIPPING_THRESHOLD) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 bg-amber-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((subtotal / SHIPPING_THRESHOLD) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
            {subtotal >= SHIPPING_THRESHOLD && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-3 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-xs font-semibold text-emerald-700">
                  You've unlocked free shipping! 🎉
                </p>
              </div>
            )}

            {/* Items list */}
            <div className="bg-white rounded-3xl border border-stone-100 overflow-hidden">
              <div className="divide-y divide-stone-50 px-5 sm:px-6">
                {cart.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onRemove={onRemove}
                    onUpdateQty={onUpdateQty}
                  />
                ))}
              </div>
            </div>

            {/* Continue shopping */}
            <button
              onClick={() => onNavigate("home")}
              className="flex items-center gap-2 mt-5 text-sm text-amber-600 font-semibold hover:text-amber-700 transition-colors group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Continue Shopping
            </button>
          </div>

          {/* ── Right: Order summary ── */}
          <div className="space-y-4">

            {/* Coupon */}
            <div className="bg-white rounded-3xl border border-stone-100 p-5">
              <h3 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z" />
                </svg>
                Coupon Code
              </h3>
              <CouponInput
                onApply={handleApplyCoupon}
                applied={coupon}
                onRemove={() => { setCoupon(null); onToast("Coupon removed", "info"); }}
              />
            </div>

            {/* Price breakdown */}
            <div className="bg-white rounded-3xl border border-stone-100 p-5">
              <h3 className="text-sm font-bold text-stone-900 mb-4">Order Summary</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="font-semibold text-stone-900">{fmt(subtotal)}</span>
                </div>

                {totalSaving > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Product savings</span>
                    <span className="font-semibold">− {fmt(totalSaving)}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  {shippingFee === 0 ? (
                    <span className="font-semibold text-emerald-600">Free</span>
                  ) : (
                    <span className="font-semibold text-stone-900">{fmt(shippingFee)}</span>
                  )}
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Coupon ({coupon.code})</span>
                    <span className="font-semibold">− {fmt(couponDiscount)}</span>
                  </div>
                )}

                <div className="border-t border-stone-100 pt-3 flex justify-between items-baseline">
                  <span className="font-black text-stone-900 text-base">Total</span>
                  <div className="text-right">
                    <p className="font-black text-stone-900 text-xl">{fmt(total)}</p>
                    <p className="text-xs text-stone-400">Inclusive of all taxes</p>
                  </div>
                </div>

                {(totalSaving + couponDiscount) > 0 && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-xs font-semibold text-emerald-700">
                      You're saving{" "}
                      <span className="font-black">{fmt(totalSaving + couponDiscount)}</span>{" "}
                      on this order!
                    </p>
                  </div>
                )}
              </div>

              {/* Checkout button */}
              <button
                onClick={handleCheckout}
                className="w-full mt-5 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold py-4 rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all active:scale-[0.98] shadow-lg shadow-amber-200/60 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                Proceed to Checkout
              </button>

              {/* Trust badges */}
              <div className="mt-4 flex items-center justify-center gap-4">
                {[
                  { icon: "🔒", text: "Secure payment" },
                  { icon: "↩️", text: "Easy returns" },
                  { icon: "✅", text: "100% authentic" },
                ].map((b) => (
                  <div key={b.text} className="flex items-center gap-1 text-stone-400">
                    <span className="text-sm">{b.icon}</span>
                    <span className="text-[10px] font-medium">{b.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* You might also like */}
            <div className="bg-white rounded-3xl border border-stone-100 p-5">
              <h3 className="text-sm font-bold text-stone-900 mb-1">Curated for you</h3>
              <p className="text-xs text-stone-400 mb-4">Based on your cart</p>
              <div className="space-y-3">
                {[
                  { name: "Warli Tribal Art", price: 1850, img: "*", region: "Maharashtra" },
                  { name: "Bidri Craft Box", price: 2400, img: "https://images.unsplash.com/photo-1596998476027-acb7e39b7e93?w=120&q=80", region: "Karnataka" },
                ].map((p) => (
                  <div key={p.name} className="flex items-center gap-3 group cursor-pointer" onClick={() => onNavigate("home")}>
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                      <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-stone-800 truncate">{p.name}</p>
                      <p className="text-[10px] text-stone-400">{p.region}</p>
                    </div>
                    <span className="text-sm font-black text-stone-900 flex-shrink-0">{fmt(p.price)}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;