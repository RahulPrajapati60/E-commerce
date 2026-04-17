import { useState , useEffect } from "react";
import { orderAPI } from "../api/order";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";


const fmt = (n) => "₹" + Math.round(n).toLocaleString("en-IN");


const formatCardNumber = (v) =>
  v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

const formatExpiry = (v) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d;
};

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", desc: "Pay instantly via any UPI app", color: "from-violet-600 to-purple-700" },
  { id: "card", label: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay & more", color: "from-blue-700 to-blue-900" },
  { id: "netbanking", label: "Net Banking", desc: "All major Indian banks supported", color: "from-sky-600 to-cyan-700" },
  { id: "wallet", label: "Wallets", desc: "Paytm, PhonePe, Amazon Pay & more", color: "from-teal-500 to-emerald-600" },
  { id: "cod", label: "Cash on Delivery", desc: "Pay cash when order arrives", color: "from-stone-600 to-stone-800" },
];

const BANKS = [
  "State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank",
  "Kotak Mahindra", "Punjab National Bank", "Bank of Baroda", "Other Bank",
];

const UPI_APPS = [
  { id: "gpay", name: "Google Pay", bg: "bg-white border border-stone-200", text: "text-stone-800", short: "G" },
  { id: "phonepe", name: "PhonePe", bg: "bg-indigo-700", text: "text-white", short: "Ph" },
  { id: "paytm", name: "Paytm", bg: "bg-sky-500", text: "text-white", short: "P" },
  { id: "bhim", name: "BHIM UPI", bg: "bg-blue-800", text: "text-white", short: "B" },
];

const WALLETS = [
  { id: "paytm", name: "Paytm", bg: "bg-sky-500", short: "P" },
  { id: "phonepe", name: "PhonePe", bg: "bg-indigo-700", short: "Ph" },
  { id: "amazonpay", name: "Amazon Pay", bg: "bg-amber-500", short: "A" },
  { id: "mobikwik", name: "MobiKwik", bg: "bg-blue-500", short: "M" },
];

// ── Reusable input styling ────────────────────────────────────────────────────
const inputCls = (err) =>
  `w-full px-4 py-3 text-sm border rounded-xl bg-stone-50 focus:outline-none focus:ring-2 transition-all
   ${err
    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
    : "border-stone-200 focus:border-amber-400 focus:ring-amber-100 hover:border-stone-300 focus:bg-white"}`;

const Field = ({ label, error, children, className = "" }) => (
  <div className={className}>
    {label && (
      <label className="block text-xs font-semibold tracking-wider uppercase text-amber-700/80 mb-2">{label}</label>
    )}
    {children}
    {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
  </div>
);

// ── Step indicator ────────────────────────────────────────────────────────────
const Steps = ({ current }) => {
  const steps = ["Address", "Payment", "Confirm"];
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={s} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300
                ${done ? "bg-emerald-500 text-white" :
                  active ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-200" :
                    "bg-stone-100 text-stone-400"}`}>
                {done
                  ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  : i + 1}
              </div>
              <span className={`text-[10px] font-semibold mt-1 ${active ? "text-amber-700" : done ? "text-emerald-600" : "text-stone-400"}`}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-16 sm:w-24 h-0.5 mb-4 mx-1 transition-all duration-500 ${i < current ? "bg-emerald-400" : "bg-stone-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Order summary sidebar ─────────────────────────────────────────────────────
const OrderSummary = ({ cart = [], total = 0, coupon }) => {
  const [open, setOpen] = useState(false);
  const subtotal = (cart || []).reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= 999 ? 0 : 99;
  const discount = coupon
    ? coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : Math.min(coupon.value, subtotal)
    : 0;

  return (
    <div className="bg-white rounded-3xl border border-stone-100 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
          </svg>
          <span className="text-sm font-bold text-stone-900">Order ({cart.reduce((s, i) => s + i.qty, 0)} items)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base font-black text-stone-900">{fmt(total)}</span>
          <svg className={`w-4 h-4 text-stone-400 transition-transform lg:hidden ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <div className={`lg:block ${open ? "block" : "hidden"}`}>
        <div className="px-5 pb-4 space-y-3 border-t border-stone-50">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center gap-3 pt-3">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">{item.qty}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-stone-800 truncate">{item.name}</p>
                <p className="text-[10px] text-stone-400">{item.region}</p>
              </div>
              <span className="text-xs font-bold text-stone-900 flex-shrink-0">{fmt(item.price * item.qty)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-stone-100 px-5 py-4 space-y-2 text-sm">
          <div className="flex justify-between text-stone-500"><span>Subtotal</span><span className="font-semibold text-stone-800">{fmt(subtotal)}</span></div>
          <div className="flex justify-between text-stone-500"><span>Shipping</span><span className={`font-semibold ${shipping === 0 ? "text-emerald-600" : "text-stone-800"}`}>{shipping === 0 ? "Free" : fmt(shipping)}</span></div>
          {discount > 0 && <div className="flex justify-between text-emerald-600"><span>Coupon ({coupon.code})</span><span className="font-semibold">−{fmt(discount)}</span></div>}
          <div className="border-t border-stone-100 pt-2 flex justify-between font-black text-stone-900 text-base"><span>Total</span><span>{fmt(total)}</span></div>
        </div>
        <div className="border-t border-stone-50 px-5 py-3 flex justify-center gap-5">
          {["🔒 Secure", "✅ Authentic", "↩️ Easy Returns"].map(b => (
            <span key={b} className="text-[10px] text-stone-400 font-medium">{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── STEP 0 — Address ──────────────────────────────────────────────────────────
const AddressStep = ({ data, onChange, onNext }) => {
  const [errors, setErrors] = useState({});
  const STATES = ["Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand", "West Bengal"];

  const validate = () => {
    const e = {};
    if (!data.fullName.trim()) e.fullName = "Full name is required";
    if (!/^[6-9]\d{9}$/.test(data.phone)) e.phone = "Enter valid 10-digit mobile number";
    if (!/^\d{6}$/.test(data.pincode)) e.pincode = "Enter valid 6-digit pincode";
    if (!data.address.trim()) e.address = "Address is required";
    if (!data.city.trim()) e.city = "City is required";
    if (!data.state) e.state = "Please select state";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const h = (field) => (e) => { onChange(field, e.target.value); setErrors(p => ({ ...p, [field]: "" })); };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-stone-900 mb-1">Delivery Address</h2>
        <p className="text-stone-400 text-sm">Where should we deliver your order?</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full Name" error={errors.fullName} className="sm:col-span-2">
          <input className={inputCls(errors.fullName)} placeholder="Rahul Sharma" value={data.fullName} onChange={h("fullName")} />
        </Field>
        <Field label="Mobile Number" error={errors.phone}>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-stone-400 font-semibold">+91</span>
            <input className={inputCls(errors.phone) + " pl-12"} placeholder="9876543210" maxLength={10} value={data.phone} onChange={h("phone")} />
          </div>
        </Field>
        <Field label="Pincode" error={errors.pincode}>
          <input className={inputCls(errors.pincode)} placeholder="110001" maxLength={6} value={data.pincode} onChange={h("pincode")} />
        </Field>
        <Field label="Flat / House / Building" error={errors.address} className="sm:col-span-2">
          <input className={inputCls(errors.address)} placeholder="Flat 4B, Sunshine Apartments" value={data.address} onChange={h("address")} />
        </Field>
        <Field label="Area / Locality" className="sm:col-span-2">
          <input className={inputCls(false)} placeholder="Sector 21, Noida" value={data.locality} onChange={h("locality")} />
        </Field>
        <Field label="City" error={errors.city}>
          <input className={inputCls(errors.city)} placeholder="New Delhi" value={data.city} onChange={h("city")} />
        </Field>
        <Field label="State" error={errors.state}>
          <select className={inputCls(errors.state)} value={data.state} onChange={h("state")}>
            <option value="">Select state</option>
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </div>
      <div>
        <p className="text-xs font-semibold tracking-wider uppercase text-amber-700/80 mb-2">Address Type</p>
        <div className="flex gap-2">
          {["Home", "Office", "Other"].map(t => (
            <button key={t} onClick={() => onChange("addressType", t)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${data.addressType === t ? "bg-amber-600 text-white border-amber-600" : "bg-white text-stone-600 border-stone-200 hover:border-amber-300"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <button onClick={() => validate() && onNext()}
        className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold py-4 rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all active:scale-[0.98] shadow-lg shadow-amber-200 flex items-center justify-center gap-2">
        Continue to Payment
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
      </button>
    </div>
  );
};

// ── STEP 1 — Payment ──────────────────────────────────────────────────────────
const PaymentStep = ({ total, onNext, onBack }) => {
  const [method, setMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [upiApp, setUpiApp] = useState("");
  const [upiError, setUpiError] = useState("");
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [cardErr, setCardErr] = useState({});
  const [bank, setBank] = useState("");
  const [wallet, setWallet] = useState("");
  const [processing, setProcessing] = useState(false);

  const handlePay = () => {
    if (method === "upi") {
      if (!upiApp && !upiId) { setUpiError("Select a UPI app or enter your UPI ID"); return; }
      if (upiId && !/^[\w.\-_]{2,}@[a-z]{2,}$/.test(upiId)) { setUpiError("Enter valid UPI ID (e.g. name@upi)"); return; }
    }
    if (method === "card") {
      const e = {};
      if (card.number.replace(/\s/g, "").length < 16) e.number = "Enter valid 16-digit card number";
      if (!card.name.trim()) e.name = "Cardholder name is required";
      if (card.expiry.length < 5) e.expiry = "Enter valid expiry (MM/YY)";
      if (card.cvv.length < 3) e.cvv = "Enter valid CVV";
      setCardErr(e);
      if (Object.keys(e).length > 0) return;
    }
    if (method === "netbanking" && !bank) return;
    if (method === "wallet" && !wallet) return;

    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onNext({
        method,
        upiId,
        upiApp,
        bank,
        wallet,
        cardNumber: card.number,  
        cardHolder: card.name,
        cardExpiry: card.expiry,
      });
    }, 1800);
  };

  const methodIcon = {
    upi: <div className="w-10 h-6 rounded bg-violet-600 flex items-center justify-center text-white text-xs font-black">UPI</div>,
    card: <div className="w-10 h-6 rounded bg-blue-800 flex items-center justify-center text-white text-[9px] font-black">CARD</div>,
    netbanking: <div className="w-10 h-6 rounded bg-sky-600 flex items-center justify-center text-white text-[9px] font-black">NET</div>,
    wallet: <div className="w-10 h-6 rounded bg-teal-500 flex items-center justify-center text-white text-[9px] font-black">PAY</div>,
    cod: <div className="w-10 h-6 rounded bg-stone-700 flex items-center justify-center text-white text-[9px] font-black">COD</div>,
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-stone-900 mb-1">Payment Method</h2>
        <p className="text-stone-400 text-sm">Choose how you'd like to pay {fmt(total)}</p>
      </div>

      {/* Method selector */}
      <div className="space-y-2">
        {PAYMENT_METHODS.map((m) => (
          <button key={m.id} onClick={() => setMethod(m.id)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border text-left transition-all duration-200
              ${method === m.id ? "border-amber-400 bg-amber-50/60 shadow-sm shadow-amber-100" : "border-stone-200 bg-white hover:border-amber-200 hover:bg-stone-50"}`}>
            {methodIcon[m.id]}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold ${method === m.id ? "text-amber-800" : "text-stone-800"}`}>{m.label}</p>
              <p className="text-xs text-stone-400">{m.desc}</p>
            </div>
            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${method === m.id ? "border-amber-500" : "border-stone-300"}`}>
              {method === m.id && <div className="w-2 h-2 rounded-full bg-amber-500" />}
            </div>
          </button>
        ))}
      </div>

      {/* ── UPI ── */}
      {method === "upi" && (
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Pay via App</p>
          <div className="grid grid-cols-4 gap-2">
            {UPI_APPS.map((app) => (
              <button key={app.id} onClick={() => { setUpiApp(app.id); setUpiId(""); setUpiError(""); }}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all ${upiApp === app.id ? "border-amber-400 bg-amber-50" : "border-stone-200 bg-white hover:border-amber-200"}`}>
                <div className={`w-9 h-9 rounded-xl ${app.bg} flex items-center justify-center text-xs font-black ${app.text}`}>{app.short}</div>
                <span className="text-[10px] font-semibold text-stone-600 text-center leading-tight">{app.name}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-xs text-stone-400 font-medium">or enter UPI ID</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>
          <div>
            <input value={upiId} onChange={(e) => { setUpiId(e.target.value); setUpiApp(""); setUpiError(""); }}
              placeholder="yourname@upi" className={inputCls(upiError)} />
            {upiError && <p className="mt-1.5 text-xs text-red-500 font-medium">{upiError}</p>}
          </div>
        </div>
      )}

      {/* ── Card ── */}
      {method === "card" && (
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4">
          {/* Live card preview */}
          <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-2 right-6 w-20 h-20 rounded-full bg-amber-400" />
              <div className="absolute top-2 right-14 w-20 h-20 rounded-full bg-white" />
            </div>
            <div className="relative">
              <p className="text-xs text-white/50 mb-5">Credit / Debit Card</p>
              <p className="font-mono text-lg tracking-[0.25em] mb-5">{card.number || "•••• •••• •••• ••••"}</p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[9px] text-white/50 uppercase mb-0.5">Cardholder Name</p>
                  <p className="text-sm font-semibold uppercase">{card.name || "YOUR NAME"}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-white/50 uppercase mb-0.5">Expires</p>
                  <p className="text-sm font-semibold">{card.expiry || "MM/YY"}</p>
                </div>
              </div>
            </div>
          </div>

          <Field label="Card Number" error={cardErr.number}>
            <input className={inputCls(cardErr.number) + " font-mono tracking-wider"} placeholder="1234 5678 9012 3456"
              value={card.number} maxLength={19}
              onChange={(e) => { setCard(c => ({ ...c, number: formatCardNumber(e.target.value) })); setCardErr(er => ({ ...er, number: "" })); }} />
          </Field>
          <Field label="Name on Card" error={cardErr.name}>
            <input className={inputCls(cardErr.name)} placeholder="Rahul Sharma"
              value={card.name} onChange={(e) => { setCard(c => ({ ...c, name: e.target.value })); setCardErr(er => ({ ...er, name: "" })); }} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Expiry Date" error={cardErr.expiry}>
              <input className={inputCls(cardErr.expiry) + " font-mono"} placeholder="MM/YY" maxLength={5}
                value={card.expiry} onChange={(e) => { setCard(c => ({ ...c, expiry: formatExpiry(e.target.value) })); setCardErr(er => ({ ...er, expiry: "" })); }} />
            </Field>
            <Field label="CVV" error={cardErr.cvv}>
              <input className={inputCls(cardErr.cvv) + " font-mono tracking-widest"} placeholder="•••" type="password" maxLength={4}
                value={card.cvv} onChange={(e) => { setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, "") })); setCardErr(er => ({ ...er, cvv: "" })); }} />
            </Field>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
            <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <p className="text-xs text-blue-600 font-medium">Your card data is secured with 256-bit SSL encryption</p>
          </div>
        </div>
      )}

      {/* ── Net Banking ── */}
      {method === "netbanking" && (
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-3">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Select Your Bank</p>
          <div className="grid grid-cols-2 gap-2">
            {BANKS.map((b) => (
              <button key={b} onClick={() => setBank(b)}
                className={`flex items-center gap-2.5 px-3 py-3 rounded-xl border text-left transition-all ${bank === b ? "border-amber-400 bg-amber-50 shadow-sm" : "border-stone-200 bg-white hover:border-amber-200"}`}>
                <span className="text-xl">🏦</span>
                <span className="text-xs font-semibold text-stone-700 leading-tight">{b}</span>
              </button>
            ))}
          </div>
          {!bank && <p className="text-xs text-amber-600 font-medium">Please select your bank to continue</p>}
        </div>
      )}

      {/* ── Wallets ── */}
      {method === "wallet" && (
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-3">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Select Wallet</p>
          <div className="grid grid-cols-2 gap-3">
            {WALLETS.map((w) => (
              <button key={w.id} onClick={() => setWallet(w.id)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all ${wallet === w.id ? "border-amber-400 bg-amber-50 shadow-sm" : "border-stone-200 bg-white hover:border-amber-200"}`}>
                <div className={`w-9 h-9 rounded-xl ${w.bg} flex items-center justify-center text-white text-xs font-black flex-shrink-0`}>{w.short}</div>
                <span className="text-sm font-semibold text-stone-800">{w.name}</span>
              </button>
            ))}
          </div>
          {!wallet && <p className="text-xs text-amber-600 font-medium">Please select a wallet to continue</p>}
        </div>
      )}

      {/* ── COD ── */}
      {method === "cod" && (
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-stone-900">Cash on Delivery</p>
              <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                Pay <span className="font-bold text-stone-700">{fmt(total)}</span> in cash when delivered. Please keep exact change ready.
              </p>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            <p className="text-xs text-amber-700 font-medium">📦 Estimated delivery: 5–7 business days. COD available for orders up to ₹10,000.</p>
          </div>
        </div>
      )}

      {/* Action row */}
      <div className="flex gap-3 pt-1">
        <button onClick={onBack}
          className="px-5 py-3.5 border border-stone-200 rounded-xl text-sm font-semibold text-stone-600 hover:border-stone-300 hover:bg-stone-50 transition-all flex-shrink-0">
          ← Back
        </button>
        <button onClick={handlePay} disabled={processing}
          className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold py-3.5 rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all active:scale-[0.98] shadow-lg shadow-amber-200 disabled:opacity-70 flex items-center justify-center gap-2">
          {processing ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing…</>
          ) : (
            <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
              Pay {fmt(total)}</>
          )}
        </button>
      </div>
    </div>
  );
};

const ConfirmStep = ({ address, total, cart, paymentInfo, coupon, onBack, onPlace }) => {
  const [placing, setPlacing] = useState(false);
  const [apiError, setApiError] = useState("");
  const { accessToken } = useAuth();

  const handlePlace = async () => {
    if (!accessToken) {
      setApiError("Please login to place order");
      return;
    }

    setPlacing(true);
    setApiError("");

    try {
      const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
      const shippingFee = subtotal >= 999 ? 0 : 99;
      const couponDiscount = coupon
        ? coupon.type === "percent"
          ? Math.round((subtotal * coupon.value) / 100)
          : Math.min(coupon.value, subtotal)
        : 0;

      const payload = {
        items: cart.map((item) => ({
          productId: item.id,
          name: item.name,
          category: item.category || "General",
          region: item.region || "",
          price: Number(item.price),
          originalPrice: item.originalPrice ? Number(item.originalPrice) : null,
          qty: Number(item.qty),
          img: item.img || "",
        })),
        deliveryAddress: address,
        payment: paymentInfo,
        subtotal: Number(subtotal),
        shippingFee: Number(shippingFee),
        couponCode: coupon?.code || "",
        couponDiscount: Number(couponDiscount),
        total: Number(total),
      };

      const result = await orderAPI.placeOrder(payload, accessToken);

      onPlace(result.order);        // Go to success page

    } catch (err) {
      console.error("Order Error:", err);
      setApiError(err.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-stone-900 mb-1">Review & Place Order</h2>
        <p className="text-stone-400 text-sm">Double-check before placing.</p>
      </div>

      {/* Address */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-stone-800">Delivery Address</p>
          <button onClick={onBack} className="text-xs text-amber-600 font-semibold">Edit</button>
        </div>
        <p className="text-sm font-bold">{address.fullName}</p>
        <p className="text-sm">{address.address}</p>
        <p className="text-sm">{address.city}, {address.state} - {address.pincode}</p>
      </div>

      {/* Items */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5">
        <p className="text-sm font-bold mb-3">Items ({cart.reduce((s, i) => s + i.qty, 0)})</p>
        {cart.map((item) => (
          <div key={item.id} className="flex justify-between mb-2">
            <span>{item.name} × {item.qty}</span>
            <span>{fmt(item.price * item.qty)}</span>
          </div>
        ))}
      </div>

      <button
        onClick={handlePlace}
        disabled={placing || cart.length === 0}
        className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-4 rounded-xl font-bold"
      >
        {placing ? "Placing Order..." : `Place Order • ${fmt(total)}`}
      </button>

      {apiError && <p className="text-red-500 text-sm text-center">{apiError}</p>}
    </div>
  );
};

// ── Order Success ─────────────────────────────────────────────────────────────
const OrderSuccess = ({ onNavigate, order, address }) => {
  const orderId = order?.orderId || "UTS-XXXXXXXX";
  const total = order?.total || 0;
  const delivery = order?.estimatedDelivery
    ? new Date(order.estimatedDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl shadow-amber-100/60 border border-amber-50 p-8 max-w-md w-full text-center">
        <div className="relative w-28 h-28 mx-auto mb-6">
          <div className="w-28 h-28 bg-emerald-50 rounded-full flex items-center justify-center">
            <svg className="w-14 h-14 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <div className="absolute -bottom-1 -right-1 w-9 h-9 bg-amber-400 rounded-full flex items-center justify-center border-2 border-white text-lg">🎉</div>
        </div>

        <h2 className="text-2xl font-black text-stone-900 mb-1">Order Placed!</h2>
        <p className="text-stone-500 text-sm mb-6 leading-relaxed">
          Thank you for shopping with <span className="font-bold text-amber-600">Utsav.in</span>. Your handcrafted items are on their way!
        </p>

        <div className="bg-stone-50 rounded-2xl p-5 mb-6 text-left space-y-3">
          {[
            { label: "Order ID", value: orderId, hl: true },
            { label: "Amount Paid", value: fmt(total), hl: true },
            { label: "Deliver to", value: `${address.city}, ${address.state}`, hl: false },
            { label: "Expected by", value: delivery, hl: false },
          ].map(({ label, value, hl }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-stone-500">{label}</span>
              <span className={`font-bold ${hl ? "text-amber-700" : "text-stone-800"}`}>{value}</span>
            </div>
          ))}
        </div>

        {/* Delivery timeline */}
        <div className="flex items-center justify-between mb-8 px-2">
          {[{ icon: "✅", label: "Confirmed" }, { icon: "📦", label: "Packed" }, { icon: "🚚", label: "Shipped" }, { icon: "🏠", label: "Delivered" }].map((s, i) => (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base ${i === 0 ? "bg-emerald-100" : "bg-stone-100"}`}>{s.icon}</div>
              <span className={`text-[10px] font-semibold ${i === 0 ? "text-emerald-600" : "text-stone-400"}`}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <button onClick={() => onNavigate("home")}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold py-3.5 rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all active:scale-[0.98]">
            Continue Shopping
          </button>
          <button onClick={() => onNavigate("profile")}
            className="w-full border border-stone-200 text-stone-700 font-semibold py-3 rounded-xl hover:bg-stone-50 transition-colors text-sm">
            View My Orders
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main PaymentPage ──────────────────────────────────────────────────────────
const PaymentPage = ({
  onNavigate,
  onToast,
  cart = [],          
  total = 0,
  coupon = null,
  onClearCart,
}) => {
  
  const { accessToken, isLoggedIn } = useAuth();


  

  //  Load cart from localStorage FIRST
  const [safeCart, setSafeCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    if (saved) return JSON.parse(saved);
    return Array.isArray(cart) ? cart : [];
  });
  //  Sync to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(safeCart));
  }, [safeCart]);

  //  Update when parent cart changes
  useEffect(() => {
    if (cart && cart.length) {
      setSafeCart(cart);
    }
  }, [cart]);

  const calculatedTotal = safeCart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.qty || 1),
    0
  );

  const [step, setStep] = useState(0);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [placedOrder, setPlacedOrder] = useState(null);
  
  const [address, setAddress] = useState({
    fullName: "", phone: "", pincode: "", address: "",
    locality: "", city: "", state: "", addressType: "Home",
  });

  const updateAddress = (field, value) =>
    setAddress((prev) => ({ ...prev, [field]: value }));

  if (step === 3) {
    return (
      <OrderSuccess
        onNavigate={(p) => { onClearCart?.(); onNavigate(p); }}
        order={placedOrder}
        address={address}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <button
          onClick={() => step === 0 ? onNavigate("cart") : setStep(s => s - 1)}
          className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 mb-6 transition-colors group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {step === 0 ? "Back to Cart" : "Back"}
        </button>

        <Steps current={step} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          <div className="bg-white rounded-3xl border border-stone-100 p-6 sm:p-8">
            {step === 0 && <AddressStep data={address} onChange={updateAddress} onNext={() => setStep(1)} />}

            {step === 1 && (
              <PaymentStep
                total={calculatedTotal || total}
                onNext={(pInfo) => { setPaymentInfo(pInfo); setStep(2); }}
                onBack={() => setStep(0)}
              />
            )}

            {step === 2 && (
              <ConfirmStep
                address={address}
                total={calculatedTotal || total}
                cart={safeCart}                    
                paymentInfo={paymentInfo}
                coupon={coupon}
                onBack={() => setStep(1)}
                onPlace={(order) => {
                  setPlacedOrder(order);
                  setStep(3);
                  onToast("Order placed successfully! 🎉", "success");
                }}
              />
            )}
          </div>

          <div className="lg:sticky lg:top-24">
            <OrderSummary cart={safeCart} total={calculatedTotal || total} coupon={coupon} />
          </div>
        </div>
      </div>
    </div>
  );
};


export default PaymentPage;