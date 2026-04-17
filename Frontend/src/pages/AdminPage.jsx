import { useState, useEffect } from "react";
import { authAPI } from "../api/auth";
import { productAPI } from "../api/Product";
import { useAuth } from "../context/AuthContext";

// ── Shared helpers ────────────────────────────────────────────────────────────
const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");
const inputCls = (err) =>
  `w-full px-4 py-3 text-sm border rounded-xl bg-stone-50 focus:outline-none focus:ring-2 transition-all
   ${err?"border-red-300 focus:border-red-400 focus:ring-red-100":"border-stone-200 focus:border-amber-400 focus:ring-amber-100 hover:border-stone-300 focus:bg-white"}`;

const CATEGORIES = ["Sarees","Jewellery","Shawls","Apparel","Art","Décor","Other"];
const BADGES = ["","Bestseller","New","Sale","Premium","Handcrafted"];

const EMPTY_FORM = {
  name:"", description:"", price:"", originalPrice:"",
  category:"Sarees", region:"", badge:"", img:"", stock:"", tags:"",
};

// ── Product form modal ────────────────────────────────────────────────────────
const ProductFormModal = ({ initial, onSave, onClose, loading }) => {
  const [form,   setForm]   = useState(initial || EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const isEdit = !!initial;

  const h = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    setErrors(p => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())         e.name     = "Required";
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = "Enter valid price";
    if (!form.category)            e.category = "Required";
    if (!form.img.trim())          e.img      = "Image URL is required";
    if (!form.stock || isNaN(form.stock)) e.stock = "Enter stock quantity";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const payload = {
      ...form,
      price:         Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      stock:         Number(form.stock),
      badge:         form.badge || null,
      tags:          form.tags ? form.tags.split(",").map(t=>t.trim()).filter(Boolean) : [],
    };
    onSave(payload);
  };

  const Field = ({ label, field, type="text", placeholder="", className="" }) => (
    <div className={className}>
      <label className="block text-xs font-semibold tracking-wider uppercase text-amber-700/80 mb-2">{label}</label>
      <input type={type} value={form[field]} onChange={h(field)} placeholder={placeholder} className={inputCls(errors[field])}/>
      {errors[field] && <p className="mt-1 text-xs text-red-500">{errors[field]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-5 border-b border-stone-100 flex items-center justify-between rounded-t-3xl z-10">
          <h2 className="text-lg font-black text-stone-900">{isEdit ? "Edit Product" : "Add New Product"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-stone-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Image preview */}
          {form.img && (
            <div className="w-full h-40 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
              <img src={form.img} alt="Preview" className="w-full h-full object-cover" onError={e=>e.target.style.display="none"}/>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Product Name *"   field="name"          placeholder="Banarasi Silk Saree"   className="sm:col-span-2"/>
            <Field label="Price (₹) *"      field="price"         type="number" placeholder="4999"/>
            <Field label="Original Price"   field="originalPrice" type="number" placeholder="7000 (optional)"/>

            <div>
              <label className="block text-xs font-semibold tracking-wider uppercase text-amber-700/80 mb-2">Category *</label>
              <select value={form.category} onChange={h("category")} className={inputCls(errors.category)}>
                {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
            </div>

            <Field label="Region / Origin"  field="region"  placeholder="Varanasi, UP"/>

            <div>
              <label className="block text-xs font-semibold tracking-wider uppercase text-amber-700/80 mb-2">Badge</label>
              <select value={form.badge} onChange={h("badge")} className={inputCls(false)}>
                {BADGES.map(b=><option key={b} value={b}>{b||"None"}</option>)}
              </select>
            </div>

            <Field label="Stock Quantity *" field="stock" type="number" placeholder="50"/>
          </div>

          <Field label="Main Image URL *" field="img" placeholder="https://images.unsplash.com/…"/>

          <div>
            <label className="block text-xs font-semibold tracking-wider uppercase text-amber-700/80 mb-2">Description</label>
            <textarea rows={3} value={form.description} onChange={h("description")}
              placeholder="Describe the product, its craftsmanship, materials…"
              className="w-full px-4 py-3 text-sm border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 resize-none transition-all"/>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wider uppercase text-amber-700/80 mb-2">Tags (comma separated)</label>
            <input value={form.tags} onChange={h("tags")} placeholder="silk, handwoven, traditional" className={inputCls(false)}/>
            <p className="text-xs text-stone-400 mt-1">e.g. silk, handwoven, festival, zari</p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-stone-100 flex gap-3 rounded-b-3xl">
          <button onClick={onClose} className="flex-1 border border-stone-200 rounded-xl py-3 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading}
            className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold py-3 rounded-xl text-sm hover:from-amber-700 hover:to-orange-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
            {isEdit ? "Update Product" : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main AdminPage ─────────────────────────────────────────────────────────────
const AdminPage = ({ onNavigate }) => {
  const { user, accessToken } = useAuth();

  // Tabs
  const [tab, setTab] = useState("products");

  // Users state
  const [users,       setUsers]       = useState([]);
  const [usersLoading,setUsersLoading]= useState(false);
  const [userSearch,  setUserSearch]  = useState("");

  // Products state
  const [products,    setProducts]    = useState([]);
  const [prodLoading, setProdLoading] = useState(false);
  const [prodSearch,  setProdSearch]  = useState("");
  const [prodTotal,   setProdTotal]   = useState(0);
  const [showModal,   setShowModal]   = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast,       setToast]       = useState(null);

  const showToast = (msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!user || user.role !== "admin") { onNavigate("home"); return; }
    fetchUsers();
    fetchProducts();
  }, []);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await authAPI.getAllUsers(accessToken);
      if (res?.success) setUsers(res.users);
    } catch (err) { showToast(err.message, "error"); }
    finally { setUsersLoading(false); }
  };

  const fetchProducts = async () => {
    setProdLoading(true);
    try {
      const res = await productAPI.adminAll("", accessToken);
      setProducts(res.products || []);
      setProdTotal(res.total || 0);
    } catch (err) { showToast(err.message, "error"); }
    finally { setProdLoading(false); }
  };

  const handleSaveProduct = async (payload) => {
    setSaving(true);
    try {
      if (editProduct) {
        await productAPI.update(editProduct._id, payload, accessToken);
        showToast("Product updated!");
      } else {
        await productAPI.create(payload, accessToken);
        showToast("Product added to store!");
      }
      setShowModal(false);
      setEditProduct(null);
      fetchProducts();
    } catch (err) { showToast(err.message, "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await productAPI.remove(id, accessToken);
      showToast("Product removed from store.");
      setDeleteConfirm(null);
      fetchProducts();
    } catch (err) { showToast(err.message, "error"); }
  };

  if (!user || user.role !== "admin") return null;

  const filteredUsers    = users.filter(u =>
    [u.firstName, u.lastName, u.email].some(v => v?.toLowerCase().includes(userSearch.toLowerCase()))
  );
  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(prodSearch.toLowerCase())
  );

  const tabs = [
    { id:"products", label:"Products", count: prodTotal },
    { id:"users",    label:"Users",    count: users.length },
  ];

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-2xl font-black text-stone-900">Admin Panel</h1>
            <p className="text-stone-500 text-sm mt-0.5">Manage products, users & orders</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-black">
              {user.firstName?.[0]?.toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-stone-900">{user.firstName} {user.lastName}</p>
              <p className="text-[10px] font-semibold text-purple-600">Administrator</p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
          {[
            { label:"Products",  value: prodTotal,                                      color:"bg-blue-50 text-blue-700 border-blue-100" },
            { label:"Users",     value: users.length,                                   color:"bg-emerald-50 text-emerald-700 border-emerald-100" },
            { label:"Active",    value: products.filter(p=>p.isActive!==false).length,  color:"bg-amber-50 text-amber-700 border-amber-100" },
            { label:"Admins",    value: users.filter(u=>u.role==="admin").length,        color:"bg-purple-50 text-purple-700 border-purple-100" },
          ].map(s=>(
            <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-xs font-semibold mt-0.5 opacity-70">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-stone-100 rounded-2xl p-1 mb-6 w-fit">
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab===t.id?"bg-white text-stone-900 shadow-sm":"text-stone-500 hover:text-stone-700"}`}>
              {t.label}
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${tab===t.id?"bg-amber-100 text-amber-700":"bg-stone-200 text-stone-500"}`}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* ── PRODUCTS TAB ── */}
        {tab === "products" && (
          <div>
            <div className="flex items-center justify-between mb-4 gap-3">
              <div className="relative flex-1 max-w-xs">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
                </svg>
                <input value={prodSearch} onChange={e=>setProdSearch(e.target.value)} placeholder="Search products…"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"/>
              </div>
              <button onClick={()=>{setEditProduct(null);setShowModal(true);}}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:from-amber-700 hover:to-orange-700 transition-all active:scale-[0.98] shadow-lg shadow-amber-200 flex-shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                </svg>
                Add Product
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-stone-100 overflow-hidden">
              {prodLoading ? (
                <div className="flex items-center justify-center py-20 gap-3">
                  <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"/>
                  <p className="text-sm text-stone-400">Loading products…</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-stone-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/>
                    </svg>
                  </div>
                  <p className="text-stone-500 font-semibold">No products yet</p>
                  <p className="text-stone-400 text-sm mt-1">Click "Add Product" to add your first product</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-100">
                        {["Product","Category","Price","Stock","Badge","Status","Actions"].map(h=>(
                          <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-stone-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((p,i)=>(
                        <tr key={p._id} className={`border-b border-stone-50 hover:bg-amber-50/30 transition-colors ${i%2===0?"":"bg-stone-50/20"}`}>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                                <img src={p.img} alt={p.name} className="w-full h-full object-cover" onError={e=>e.target.src="https://via.placeholder.com/40"}/>
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-stone-900 truncate max-w-[180px]">{p.name}</p>
                                <p className="text-xs text-stone-400">{p.region||"—"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">{p.category}</span>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <p className="font-bold text-stone-900">{fmt(p.price)}</p>
                            {p.originalPrice&&<p className="text-xs text-stone-400 line-through">{fmt(p.originalPrice)}</p>}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.stock>10?"bg-emerald-50 text-emerald-700":p.stock>0?"bg-amber-50 text-amber-700":"bg-red-50 text-red-600"}`}>
                              {p.stock} units
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-xs text-stone-500">{p.badge||"—"}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.isActive!==false?"bg-emerald-50 text-emerald-700":"bg-red-50 text-red-500"}`}>
                              {p.isActive!==false?"Active":"Hidden"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <button onClick={()=>{
                                  setEditProduct({...p, tags: p.tags?.join(", ")||"", badge: p.badge||"", originalPrice: p.originalPrice||""});
                                  setShowModal(true);
                                }}
                                className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors" title="Edit">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"/>
                                </svg>
                              </button>
                              <button onClick={()=>setDeleteConfirm(p)}
                                className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors" title="Remove">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── USERS TAB ── */}
        {tab === "users" && (
          <div>
            <div className="relative mb-4 max-w-xs">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
              </svg>
              <input value={userSearch} onChange={e=>setUserSearch(e.target.value)} placeholder="Search users…"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"/>
            </div>

            <div className="bg-white rounded-3xl border border-stone-100 overflow-hidden">
              {usersLoading ? (
                <div className="flex items-center justify-center py-20 gap-3">
                  <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"/>
                  <p className="text-sm text-stone-400">Loading users…</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-100">
                        {["User","Email","Role","Verified","Joined"].map(h=>(
                          <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-stone-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u,i)=>(
                        <tr key={u._id} className={`border-b border-stone-50 hover:bg-amber-50/40 transition-colors ${i%2===0?"":"bg-stone-50/30"}`}>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                {u.firstName?.[0]?.toUpperCase()}
                              </div>
                              <p className="font-semibold text-stone-900">{u.firstName} {u.lastName}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-stone-600">{u.email}</td>
                          <td className="px-5 py-4">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${u.role==="admin"?"bg-purple-100 text-purple-700":"bg-stone-100 text-stone-600"}`}>{u.role}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-xs font-semibold ${u.isVarified?"text-emerald-600":"text-stone-400"}`}>{u.isVarified?"Yes":"Pending"}</span>
                          </td>
                          <td className="px-5 py-4 text-stone-400 text-xs">
                            {u.createdAt?new Date(u.createdAt).toLocaleDateString("en-IN"):"—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUsers.length===0&&<div className="py-12 text-center text-stone-400 text-sm">No users found</div>}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Product form modal */}
      {showModal && (
        <ProductFormModal
          initial={editProduct}
          onSave={handleSaveProduct}
          onClose={()=>{setShowModal(false);setEditProduct(null);}}
          loading={saving}
        />
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
              </svg>
            </div>
            <h3 className="text-base font-black text-stone-900 text-center mb-2">Remove Product?</h3>
            <p className="text-stone-500 text-sm text-center mb-5">
              "<span className="font-semibold text-stone-700">{deleteConfirm.name}</span>" will be hidden from the store.
            </p>
            <div className="flex gap-3">
              <button onClick={()=>setDeleteConfirm(null)} className="flex-1 border border-stone-200 rounded-xl py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition-colors">Cancel</button>
              <button onClick={()=>handleDelete(deleteConfirm._id)} className="flex-1 bg-red-500 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-red-600 transition-colors">Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[999] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-sm font-semibold border animate-[slideIn_0.3s_ease_forwards] ${toast.type==="error"?"bg-red-50 border-red-200 text-red-700":"bg-white border-stone-200 text-stone-700"}`}>
          {toast.type==="error"
            ?<svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
            :<svg className="w-4 h-4 flex-shrink-0 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          }
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default AdminPage;