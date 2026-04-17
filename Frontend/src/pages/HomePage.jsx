import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { productAPI } from "../api/Product";



const CATEGORIES = ["All", "Sarees", "Jewellery", "Shawls", "Apparel", "Art", "Décor"];

const BADGE_STYLES = {
  Bestseller: "bg-amber-100 text-amber-800",
  New: "bg-emerald-100 text-emerald-800",
  Sale: "bg-rose-100 text-rose-800",
  Premium: "bg-purple-100 text-purple-700",
  Handcrafted: "bg-stone-100 text-stone-700",
};

const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");

const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
};

const Stars = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <svg key={s} className={`w-3 h-3 ${s <= Math.floor(rating) ? "text-amber-400" : "text-stone-200"}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

// Skeleton for loading state
const ProductSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-stone-100 animate-pulse">
    <div className="aspect-square bg-stone-100" />
    <div className="p-4 space-y-2">
      <div className="h-3 bg-stone-100 rounded w-16" />
      <div className="h-4 bg-stone-100 rounded w-3/4" />
      <div className="h-3 bg-stone-100 rounded w-1/2" />
      <div className="h-8 bg-stone-100 rounded mt-3" />
    </div>
  </div>
);


const ProductCard = ({
  product,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  onNavigate,     
  index
}) => {
  const [ref, visible] = useInView();
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.stopPropagation();
    onAddToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category,
      region: product.region,
      img: product.img,
      qty: 1
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div
      ref={ref}
      className="group bg-white rounded-2xl overflow-hidden border border-stone-100 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-100/50 transition-all duration-300 flex flex-col cursor-pointer"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.5s ease ${index * 80}ms, transform 0.5s ease ${index * 80}ms, box-shadow 0.2s, border-color 0.2s`
      }}
      onClick={() => onNavigate("product", product._id)}   
    >
      <div className="relative overflow-hidden aspect-square bg-stone-50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.badge && (
          <span className={`absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full ${BADGE_STYLES[product.badge] || ""}`}>
            {product.badge}
          </span>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(product._id); }}
          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
        >
          <svg
            className={`w-4 h-4 transition-colors ${wishlist.has(product._id) ? "fill-rose-500 text-rose-500" : "text-stone-300"}`}
            fill={wishlist.has(product._id) ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        <div className="absolute bottom-3 left-3">
          <span className="text-[10px] font-bold bg-black/50 backdrop-blur-sm text-white/90 px-2 py-0.5 rounded-full">
            📍 {product.region}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-[10px] font-bold tracking-widest uppercase text-amber-600 mb-1">{product.category}</p>
        <h3 className="font-bold text-stone-900 text-sm mb-2 leading-snug">{product.name}</h3>

        <div className="flex items-center gap-1.5 mb-3">
          <Stars rating={product.rating || 4.5} />
          <span className="text-xs text-stone-400">({product.numReviews || 0})</span>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className="text-base font-black text-stone-900">{fmt(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs text-stone-400 line-through ml-2">{fmt(product.originalPrice)}</span>
            )}
          </div>

          <button
            onClick={handleAdd}
            className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all duration-200 active:scale-95 ${added ? "bg-emerald-500 text-white" : "bg-stone-900 text-white hover:bg-amber-600"}`}
          >
            {added ? "Added ✓" : "+ Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};


// ─── Main page ────────────────────────────────────────────────────────────────

const HeroCarousel = ({ onNavigate, featuredProducts }) => {
  const slides = featuredProducts.length >= 3
    ? featuredProducts.slice(0, 3).map(p => ({
      bg: "from-amber-700 to-orange-800",
      tag: p.badge || "New Arrival",
      title: p.name,
      sub: p.description || `Authentic handcraft from ${p.region}`,
      img: p.img,
      cta: `Shop ${p.category}`,
      category: p.category,
    }))
    : [
      { bg: "from-amber-700 to-orange-800", tag: "New Collection", title: "Banarasi\nSilk Story", sub: "Handwoven heritage from the ghats of Varanasi", img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80", cta: "Explore Sarees", category: "Sarees" },
      { bg: "from-rose-800 to-red-900", tag: "Artisan Picks", title: "Rajasthani\nJewellery", sub: "Kundan, Meenakari & Polki — straight from Jaipur", img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80", cta: "Shop Jewellery", category: "Jewellery" },
      { bg: "from-stone-700 to-stone-900", tag: "Winter Warmth", title: "Kashmir\nPashmina", sub: "Pure luxury from the valley — unmatched softness", img: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&q=80", cta: "Browse Shawls", category: "Shawls" },
    ];

  const [cur, setCur] = useState(0);
  useEffect(() => { const t = setInterval(() => setCur(c => (c + 1) % slides.length), 5000); return () => clearInterval(t); }, [slides.length]);
  const s = slides[cur];

  return (
    <div className={`relative bg-gradient-to-r ${s.bg} overflow-hidden rounded-3xl transition-all duration-700`} style={{ minHeight: "420px" }}>
      <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-24" />
      <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/5 rounded-full translate-y-24 translate-x-12" />
      <div className="relative flex flex-col lg:flex-row items-center gap-8 px-8 py-12 lg:px-16">
        <div className="flex-1 text-white">
          <span className="inline-block text-xs font-bold tracking-widest uppercase bg-white/15 px-3 py-1.5 rounded-full mb-4">{s.tag}</span>
          <h1 className="text-4xl lg:text-5xl font-black leading-tight mb-4 whitespace-pre-line">{s.title}</h1>
          <p className="text-white/70 text-sm leading-relaxed max-w-xs mb-8">{s.sub}</p>
          <button onClick={() => onNavigate("collections")}
            className="inline-flex items-center gap-2 bg-white text-stone-900 font-bold text-sm px-6 py-3 rounded-xl hover:bg-amber-50 transition-colors">
            {s.cta}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          </button>
        </div>
        <div className="w-56 h-56 lg:w-72 lg:h-72 rounded-3xl overflow-hidden flex-shrink-0 border-4 border-white/20 shadow-2xl">
          <img src={s.img} alt={s.title} className="w-full h-full object-cover" />
        </div>
      </div>
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCur(i)} className={`rounded-full transition-all duration-300 ${i === cur ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40"}`} />
        ))}
      </div>
    </div>
  );
};


const HomePage = ({ onNavigate, onToast, cart = [], onAddToCart }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState("All");
  const [wishlist, setWishlist] = useState(new Set());
  const [sortBy, setSortBy] = useState("newest");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [trustRef, trustVisible] = useInView();
  const LIMIT = 12;

 
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (activeCategory !== "All") params.set("category", activeCategory);
      if (search) params.set("search", search);
      if (sortBy) params.set("sort", sortBy);

      params.set("page", page);
      params.set("limit", LIMIT);

      const res = await productAPI.getAll(`?${params.toString()}`);

      setProducts(res.products || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error("Fetch error:", err);
      onToast("Failed to load products: " + (err.response?.data?.message || err.message), "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchProducts(); }, [activeCategory, sortBy, search, page]);

  const addToCart = (product) => { if (onAddToCart) onAddToCart(product); };

  const toggleWishlist = (id) => {
    setWishlist(prev => {
      const next = new Set(prev);
      const wasAdded = !next.has(id);
      next.has(id) ? next.delete(id) : next.add(id);
      onToast(wasAdded ? "Saved to wishlist ♥" : "Removed from wishlist", wasAdded ? "success" : "info");
      return next;
    });
  };

  const handleSearch = () => { setSearch(searchInput); setPage(1); };

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">

        <HeroCarousel onNavigate={onNavigate} featuredProducts={products.filter(p => p.badge)} />

        {/* USP strip */}
        <div ref={trustRef} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[{ icon: "🎨", title: "100% Handcrafted", sub: "By Indian artisans" }, { icon: "🚚", title: "Free Shipping", sub: "Orders above ₹999" }, { icon: "↩️", title: "Easy Returns", sub: "15-day return policy" }, { icon: "🔒", title: "Secure Payment", sub: "256-bit encryption" }].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-stone-100 p-4 flex items-center gap-3 hover:border-amber-200 transition-all duration-300"
              style={{ opacity: trustVisible ? 1 : 0, transform: trustVisible ? "translateY(0)" : "translateY(20px)", transition: `opacity 0.5s ease ${i * 100}ms, transform 0.5s ease ${i * 100}ms` }}>
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div>
                <p className="text-xs font-bold text-stone-900">{item.title}</p>
                <p className="text-xs text-stone-400">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-stone-900">Our Collection</h2>
              {!loading && <p className="text-xs text-stone-400 mt-0.5">{total} products found</p>}
            </div>
            <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}
              className="text-xs border border-stone-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-amber-400 cursor-pointer text-stone-600">
              <option value="newest">Newest First</option>
              <option value="rating">Top Rated</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => { setActiveCategory(cat); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${activeCategory === cat ? "bg-stone-900 text-white shadow-sm" : "bg-white text-stone-600 border border-stone-200 hover:border-amber-300 hover:text-amber-700"}`}>
                {cat}
              </button>
            ))}
            <div className="relative ml-auto flex gap-2">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()}
                  placeholder="Search…"
                  className="pl-8 pr-3 py-2 text-xs border border-stone-200 rounded-xl bg-white focus:outline-none focus:border-amber-400 w-32 transition-all focus:w-44" />
              </div>
              {search && (
                <button onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}
                  className="text-xs text-stone-400 hover:text-stone-700 px-2 border border-stone-200 rounded-xl bg-white">✕</button>
              )}
            </div>
          </div>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
            : products.length > 0
              ? products.map((p, i) => (
                <ProductCard key={p._id} product={p} wishlist={wishlist} onToggleWishlist={toggleWishlist}
                  onAddToCart={addToCart} onNavigate={onNavigate} index={i} />
              ))
              : (
                <div className="col-span-full text-center py-20">
                  <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-stone-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </div>
                  <p className="text-stone-500 font-semibold">No products found</p>
                  <p className="text-stone-400 text-sm mt-1">Try a different category or search term</p>
                  <button onClick={() => { setActiveCategory("All"); setSearch(""); setSearchInput(""); }}
                    className="mt-4 text-sm text-amber-600 font-semibold hover:text-amber-700">Clear filters</button>
                </div>
              )
          }
        </div>

        {/* Pagination */}
        {!loading && total > LIMIT && (
          <div className="flex items-center justify-center gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 rounded-xl border border-stone-200 text-sm font-semibold text-stone-600 hover:border-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              ← Prev
            </button>
            <span className="text-sm text-stone-500 px-2">Page {page} of {Math.ceil(total / LIMIT)}</span>
            <button disabled={page >= Math.ceil(total / LIMIT)} onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 rounded-xl border border-stone-200 text-sm font-semibold text-stone-600 hover:border-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Next →
            </button>
          </div>
        )}

        {/* Artisan banner */}
        <div className="bg-gradient-to-r from-stone-900 to-stone-800 rounded-3xl p-8 lg:p-12 flex flex-col lg:flex-row items-center gap-8 overflow-hidden relative">
          <div className="absolute inset-0 opacity-10"><div className="absolute top-0 right-0 w-80 h-80 bg-amber-500 rounded-full translate-x-32 -translate-y-32" /></div>
          <div className="relative flex-1 text-center lg:text-left">
            <p className="text-amber-400 text-xs font-bold tracking-widest uppercase mb-2">Our Mission</p>
            <h2 className="text-2xl lg:text-3xl font-black text-white mb-3">Empowering Indian Artisans</h2>
            <p className="text-stone-400 text-sm leading-relaxed max-w-md mx-auto lg:mx-0">Every purchase directly supports a craftsperson's family. Fair wages, ethical sourcing, centuries-old traditions at your doorstep.</p>
          </div>
        </div>

        {/* Newsletter */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-3xl p-8 text-center">
          <h3 className="text-xl font-black text-stone-900 mb-1">Get 10% off your first order</h3>
          <p className="text-stone-500 text-sm mb-5">Subscribe for curated festival collections & exclusive deals.</p>
          <div className="flex gap-2 max-w-sm mx-auto">
            <input type="email" placeholder="your@email.com"
              className="flex-1 px-4 py-3 text-sm border border-amber-200 rounded-xl bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all" />
            <button onClick={() => onToast("Subscribed! 🎉 Check your inbox.", "success")}
              className="bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold px-5 py-3 rounded-xl text-sm hover:from-amber-700 hover:to-orange-700 transition-all active:scale-95 flex-shrink-0">
              Subscribe
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;