import { useState, useEffect } from "react";
import { productAPI } from "../src/api/Product.js";
import { useAuth } from "../context/AuthContext";

const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");

const BADGE_STYLES = {
  Bestseller:"bg-amber-100 text-amber-800",New:"bg-emerald-100 text-emerald-800",
  Sale:"bg-rose-100 text-rose-800",Premium:"bg-purple-100 text-purple-700",Handcrafted:"bg-stone-100 text-stone-700",
};

const Stars = ({ rating, size="sm", interactive=false, onRate }) => {
  const [hov,setHov]=useState(0);
  const sz=size==="lg"?"w-5 h-5":"w-3.5 h-3.5";
  const fill=(s)=>{
    if(interactive)return s<=(hov||rating)?"text-amber-400":"text-stone-200";
    return s<=Math.floor(rating)?"text-amber-400":"text-stone-200";
  };
  return(
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s=>(
        <svg key={s} className={`${sz} ${fill(s)} ${interactive?"cursor-pointer hover:scale-110 transition-transform":""}`}
          fill="currentColor" viewBox="0 0 20 20"
          onMouseEnter={()=>interactive&&setHov(s)} onMouseLeave={()=>interactive&&setHov(0)}
          onClick={()=>interactive&&onRate&&onRate(s)}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
};

const Skeleton=()=>(
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="bg-stone-100 rounded-3xl aspect-square"/>
      <div className="space-y-4">
        <div className="h-4 bg-stone-100 rounded w-24"/>
        <div className="h-8 bg-stone-100 rounded w-3/4"/>
        <div className="h-6 bg-stone-100 rounded w-1/3"/>
        <div className="h-20 bg-stone-100 rounded"/>
        <div className="h-12 bg-stone-100 rounded"/>
      </div>
    </div>
  </div>
);

const RelatedCard=({product,onNavigate,onAddToCart})=>(
  <div className="group bg-white rounded-2xl border border-stone-100 hover:border-amber-200 hover:shadow-lg transition-all duration-300 overflow-hidden flex-shrink-0 w-44 sm:w-48">
    <button onClick={()=>onNavigate("product",product._id)} className="block w-full">
      <div className="aspect-square overflow-hidden bg-stone-50 relative">
        <img src={product.img || product.images?.[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
        {product.badge&&<span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${BADGE_STYLES[product.badge]||""}`}>{product.badge}</span>}
      </div>
    </button>
    <div className="p-3">
      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-0.5">{product.category}</p>
      <p className="text-xs font-bold text-stone-900 leading-tight mb-2 line-clamp-2">{product.name}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm font-black text-stone-900">{fmt(product.price)}</span>
        <button onClick={()=>onAddToCart({id:product._id,name:product.name,price:product.price,originalPrice:product.originalPrice,category:product.category,region:product.region,img:product.img,qty:1})}
          className="text-[10px] font-bold bg-stone-900 text-white px-2.5 py-1.5 rounded-lg hover:bg-amber-600 transition-colors active:scale-95">
          + Cart
        </button>
      </div>
    </div>
  </div>
);

const ReviewForm=({productId,token,onReviewAdded})=>{
  const [rating,setRating]=useState(0);
  const [comment,setComment]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [done,setDone]=useState(false);

  const handleSubmit=async()=>{
    if(!rating){setError("Please select a rating");return;}
    setLoading(true);setError("");
    try{
      await productAPI.addReview(productId,{rating,comment},token);
      setDone(true);onReviewAdded();
    }catch(err){setError(err.message);}
    finally{setLoading(false);}
  };

  if(done)return(
    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
      <svg className="w-8 h-8 text-emerald-500 mx-auto mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <p className="text-sm font-bold text-emerald-800">Review submitted! Thank you.</p>
    </div>
  );

  return(
    <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-5 space-y-4">
      <p className="text-sm font-bold text-stone-800">Write a Review</p>
      <div>
        <p className="text-xs text-stone-500 mb-2">Your Rating</p>
        <Stars rating={rating} size="lg" interactive onRate={setRating}/>
      </div>
      <textarea rows={3} value={comment} onChange={e=>setComment(e.target.value)}
        placeholder="Share your experience with this product…"
        className="w-full px-4 py-3 text-sm border border-amber-200 rounded-xl bg-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 resize-none transition-all"/>
      {error&&<p className="text-xs text-red-500 font-medium">{error}</p>}
      <button onClick={handleSubmit} disabled={loading}
        className="bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:from-amber-700 hover:to-orange-700 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center gap-2">
        {loading&&<span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
        Submit Review
      </button>
    </div>
  );
};

const ProductPage=({onNavigate,onToast,productId,onAddToCart})=>{
  const {user,accessToken}=useAuth();
  const [product,setProduct]=useState(null);
  const [related,setRelated]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [activeImg,setActiveImg]=useState(0);
  const [qty,setQty]=useState(1);
  const [wishlist,setWishlist]=useState(false);
  const [added,setAdded]=useState(false);
  const [tab,setTab]=useState("description");

  const fetchProduct=async()=>{
    if(!productId)return;
    setLoading(true);setError("");
    try{
      const res=await productAPI.getById(productId);
      setProduct(res.product);
      const rel = await productAPI.getAll(`?category=${encodeURIComponent(res.product.category)}&limit=6`);
      setRelated(rel.products.filter(p=>p._id!==productId));
    }catch(err){setError(err.message);}
    finally{setLoading(false);}
  };

  useEffect(()=>{fetchProduct();},[productId]);

  const handleAddToCart=()=>{
    if(!product)return;
    const item={id:product._id,name:product.name,price:product.price,originalPrice:product.originalPrice,category:product.category,region:product.region,img:product.img};
    for(let i=0;i<qty;i++)onAddToCart({...item,qty:1});
    setAdded(true);
    onToast(`${product.name} added to cart!`,"success");
    setTimeout(()=>setAdded(false),2000);
  };

  const imgs=product?[product.img,...(product.images||[])].filter(Boolean):[];
  const saving=product?.originalPrice?product.originalPrice-product.price:0;
  const savingPct=saving>0?Math.round((saving/product.originalPrice)*100):0;

  if(loading)return <div className="min-h-screen bg-stone-50"><Skeleton/></div>;

  if(error||!product)return(
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-stone-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
          </svg>
        </div>
        <h2 className="text-lg font-bold text-stone-700 mb-1">Product not found</h2>
        <p className="text-stone-400 text-sm mb-5">{error||"This product may have been removed."}</p>
        <button onClick={()=>onNavigate("home")} className="bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-amber-700 transition-colors">Back to Shop</button>
      </div>
    </div>
  );

  return(
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-stone-400 mb-6 flex-wrap">
          <button onClick={()=>onNavigate("home")} className="hover:text-amber-600 transition-colors">Home</button>
          <span>/</span>
          <button onClick={()=>onNavigate("collections")} className="hover:text-amber-600 transition-colors">Collections</button>
          <span>/</span>
          <span className="text-stone-600 font-medium">{product.category}</span>
          <span>/</span>
          <span className="text-stone-800 font-semibold truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">

          {/* Gallery */}
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-3xl bg-stone-100 aspect-square">
              <img src={imgs[activeImg]||product.img} alt={product.name} className="w-full h-full object-cover transition-opacity duration-300"/>
              {product.badge&&<span className={`absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm ${BADGE_STYLES[product.badge]||""}`}>{product.badge}</span>}
              {savingPct>0&&<span className="absolute top-4 right-4 bg-rose-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-sm">{savingPct}% OFF</span>}
              <button onClick={()=>{setWishlist(!wishlist);onToast(wishlist?"Removed from wishlist":"Saved to wishlist ♥",wishlist?"info":"success");}}
                className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <svg className={`w-5 h-5 transition-colors ${wishlist?"fill-rose-500 text-rose-500":"text-stone-300"}`}
                  fill={wishlist?"currentColor":"none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </button>
            </div>
            {imgs.length>1&&(
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {imgs.map((img,i)=>(
                  <button key={i} onClick={()=>setActiveImg(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImg===i?"border-amber-500 shadow-md":"border-transparent hover:border-stone-300"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover"/>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold tracking-widest uppercase text-amber-600">{product.category}</span>
              {product.region&&<><span className="text-stone-300">·</span><span className="text-xs text-stone-400 font-medium">📍 {product.region}</span></>}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 leading-tight mb-3">{product.name}</h1>

            <div className="flex items-center gap-3 mb-5">
              <Stars rating={product.rating} size="lg"/>
              <span className="text-sm font-bold text-stone-700">{product.rating?.toFixed(1)}</span>
              <span className="text-sm text-stone-400">({product.numReviews} reviews)</span>
              {product.stock>0
                ?<span className="ml-auto text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">{product.stock} in stock</span>
                :<span className="ml-auto text-xs font-semibold text-red-500 bg-red-50 border border-red-100 px-3 py-1 rounded-full">Out of stock</span>
              }
            </div>

            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl font-black text-stone-900">{fmt(product.price)}</span>
              {product.originalPrice&&<span className="text-lg text-stone-400 line-through">{fmt(product.originalPrice)}</span>}
            </div>
            {saving>0&&<p className="text-sm font-semibold text-emerald-600 mb-5">You save {fmt(saving)} ({savingPct}% off)</p>}

            {product.tags?.length>0&&(
              <div className="flex flex-wrap gap-1.5 mb-5">
                {product.tags.map(tag=><span key={tag} className="text-[10px] font-semibold bg-stone-100 text-stone-600 px-2.5 py-1 rounded-full">{tag}</span>)}
              </div>
            )}

            <div className="border-t border-stone-100 my-5"/>

            <div className="flex items-center gap-4 mb-4">
              <p className="text-sm font-semibold text-stone-700">Quantity</p>
              <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-xl p-1">
                <button onClick={()=>setQty(q=>Math.max(1,q-1))} className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-500 hover:bg-white hover:text-stone-900 hover:shadow-sm transition-all font-bold text-lg leading-none">−</button>
                <span className="w-10 text-center text-sm font-bold text-stone-900">{qty}</span>
                <button onClick={()=>setQty(q=>Math.min(product.stock||99,q+1))} className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-500 hover:bg-white hover:text-stone-900 hover:shadow-sm transition-all font-bold text-lg leading-none">+</button>
              </div>
            </div>

            <div className="flex gap-3 mb-5">
              <button onClick={handleAddToCart} disabled={product.stock===0}
                className={`flex-1 font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg
                  ${added?"bg-emerald-500 text-white shadow-emerald-200":"bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-amber-200 hover:from-amber-700 hover:to-orange-700"}
                  disabled:opacity-50 disabled:cursor-not-allowed`}>
                {added
                  ?<><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Added to Cart</>
                  :<><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"/></svg>Add to Cart</>
                }
              </button>
              <button onClick={()=>{handleAddToCart();onNavigate("cart");}} disabled={product.stock===0}
                className="flex-1 border-2 border-stone-900 text-stone-900 font-bold py-3.5 rounded-xl text-sm hover:bg-stone-900 hover:text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                Buy Now
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[{icon:"🔒",title:"Secure Payment",sub:"256-bit SSL"},{icon:"↩️",title:"Easy Returns",sub:"15-day policy"},{icon:"🚚",title:"Free Shipping",sub:"Above ₹999"}].map(t=>(
                <div key={t.title} className="bg-stone-50 rounded-xl p-3 text-center border border-stone-100">
                  <span className="text-lg block mb-1">{t.icon}</span>
                  <p className="text-[10px] font-bold text-stone-700">{t.title}</p>
                  <p className="text-[10px] text-stone-400">{t.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-3xl border border-stone-100 overflow-hidden mb-10">
          <div className="flex border-b border-stone-100">
            {["description","reviews"].map(t=>(
              <button key={t} onClick={()=>setTab(t)}
                className={`flex-1 py-4 text-sm font-semibold capitalize transition-colors ${tab===t?"text-amber-700 border-b-2 border-amber-500 bg-amber-50/50":"text-stone-500 hover:text-stone-800"}`}>
                {t==="reviews"?`Reviews (${product.numReviews})`:"Description"}
              </button>
            ))}
          </div>
          <div className="p-6 sm:p-8">
            {tab==="description"&&(
              <div className="space-y-4">
                <p className="text-stone-600 text-sm leading-relaxed">{product.description||"No description available for this product."}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                  {[{label:"Category",value:product.category},{label:"Region",value:product.region||"—"},{label:"In Stock",value:product.stock||"0"},{label:"Rating",value:`${product.rating}/5`},{label:"Reviews",value:product.numReviews},{label:"Badge",value:product.badge||"None"}].map(d=>(
                    <div key={d.label} className="bg-stone-50 rounded-xl p-3 border border-stone-100">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{d.label}</p>
                      <p className="text-sm font-bold text-stone-800 mt-0.5">{d.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {tab==="reviews"&&(
              <div className="space-y-6">
                <div className="flex items-center gap-6 bg-amber-50/60 border border-amber-100 rounded-2xl p-5">
                  <div className="text-center flex-shrink-0">
                    <p className="text-5xl font-black text-stone-900 leading-none">{product.rating?.toFixed(1)}</p>
                    <Stars rating={product.rating} size="lg"/>
                    <p className="text-xs text-stone-400 mt-1">{product.numReviews} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5,4,3,2,1].map(s=>{
                      const count=product.reviews?.filter(r=>Math.floor(r.rating)===s).length||0;
                      const pct=product.numReviews>0?(count/product.numReviews)*100:0;
                      return(
                        <div key={s} className="flex items-center gap-2">
                          <span className="text-xs text-stone-500 w-2">{s}</span>
                          <svg className="w-3 h-3 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                          <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{width:`${pct}%`}}/>
                          </div>
                          <span className="text-xs text-stone-400 w-4">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {product.reviews?.length>0?(
                  <div className="space-y-4">
                    {product.reviews.map((r,i)=>(
                      <div key={i} className="border-b border-stone-50 pb-4 last:border-0">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                            {r.userName?.[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-bold text-stone-900">{r.userName}</p>
                              <Stars rating={r.rating}/>
                              <span className="text-xs text-stone-400 ml-auto flex-shrink-0">{new Date(r.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span>
                            </div>
                            {r.comment&&<p className="text-sm text-stone-600 leading-relaxed">{r.comment}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ):<p className="text-center text-stone-400 text-sm py-6">No reviews yet. Be the first!</p>}
                {user
                  ?<ReviewForm productId={product._id} token={accessToken} onReviewAdded={fetchProduct}/>
                  :<div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 text-center">
                    <p className="text-sm text-stone-600 mb-3">Sign in to write a review</p>
                    <button onClick={()=>onNavigate("login")} className="bg-amber-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-amber-700 transition-colors">Sign In</button>
                  </div>
                }
              </div>
            )}
          </div>
        </div>

        {related.length>0&&(
          <div>
            <h2 className="text-xl font-black text-stone-900 mb-4">You may also like</h2>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {related.map(p=><RelatedCard key={p._id} product={p} onNavigate={onNavigate} onAddToCart={onAddToCart}/>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
