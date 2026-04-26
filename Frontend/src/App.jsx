import { useState, useCallback, useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import { useCart } from "./hooks/useCart";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Toast from "./components/Toast";

import VerifyPage from "./pages/VerifyPage";
import HomePage from "./pages/HomePage";
import CartPage from "./pages/CartPage";
import PaymentPage from "./pages/Paymentpage.jsx";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ReVerifyPage from "./pages/ReVerifyPage";
import ProfilePage from "./pages/ProfilePage";
import MyOrdersPage from "./pages/Myorderspage.jsx";
import AdminPage from "./pages/AdminPage";
import ProductPage from "./pages/Productpage.jsx";

const PAGES_WITH_NAVBAR = ["home", "collections", "cart", "payment", "product", "about", "profile", "my-orders", "admin"];
const PAGES_WITHOUT_FOOTER = ["login", "register", "forgot-password", "reverify", "payment"];

const App = () => {
  const [page, setPage] = useState("home");
  const [productId, setProductId] = useState(null);
  const [toast, setToast] = useState(null);

  const { cart, coupon, setCoupon, addToCart, removeFromCart, updateQty, clearCart } = useCart();

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, key: Date.now() });
  }, []);

  const navigate = useCallback((p, id = null) => {
    setPage(p);
    if (id !== null) setProductId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ✅ FIX: On app load, check if backend redirected here with ?verified=success or ?verified=error
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verified = params.get("verified");
    const message = params.get("message");

    if (verified === "success") {
      setPage("login");
      showToast(message || "✅ Email verified! You can now login.", "success");
      // Clean the URL without reload
      window.history.replaceState({}, "", window.location.pathname);
    } else if (verified === "error") {
      setPage("login");
      showToast(message || "❌ Verification failed. Please request a new link.", "error");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [showToast]);

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const pageParam = params.get("page");

  // Agar URL mein ?page=verify hai, toh state ko 'verify' par set karein
  if (pageParam) {
    setPage(pageParam);
  }
}, []); // Yeh sirf ek baar chalega jab app load hogi


  const handleAddToCart = useCallback((product) => {
    addToCart(product);
    showToast(`${product.name} added to cart`, "success");
  }, [addToCart, showToast]);

  const renderPage = () => {
    switch (page) {
      case "home":
      case "collections":
        return <HomePage {...{ onNavigate: navigate, onToast: showToast, onAddToCart: handleAddToCart, cart }} />;

      case "cart":
        return (
          <CartPage
            onNavigate={navigate}
            onToast={showToast}
            cart={cart}
            coupon={coupon}
            onCouponChange={setCoupon}
            onRemove={removeFromCart}
            onUpdateQty={updateQty}
            onClearCart={clearCart}
          />
        );

      case "payment":
        return (
          <PaymentPage
            cart={cart}
            coupon={coupon}
            onNavigate={navigate}
            onToast={showToast}
            onClearCart={clearCart}
          />
        );

      case "product":
        return (
          <ProductPage
            onNavigate={navigate}
            onToast={showToast}
            productId={productId}
            onAddToCart={handleAddToCart}
          />
        );

      case "login": return <LoginPage onNavigate={navigate} onToast={showToast} />;
      case "register": return <RegisterPage onNavigate={navigate} onToast={showToast} />;
      case "forgot-password": return <ForgotPasswordPage onNavigate={navigate} onToast={showToast} />;
      case "reverify": return <ReVerifyPage onNavigate={navigate} onToast={showToast} />;
      case "profile": return <ProfilePage onNavigate={navigate} onToast={showToast} />;
      case "my-orders": return <MyOrdersPage onNavigate={navigate} onToast={showToast} />;
      case "admin": return <AdminPage onNavigate={navigate} onToast={showToast} />;
      case "verify": return <VerifyPage onNavigate={navigate} onToast={showToast} />;

      default: return <HomePage onNavigate={navigate} onToast={showToast} onAddToCart={handleAddToCart} cart={cart} />;
    }
  };

  const showNav = PAGES_WITH_NAVBAR.includes(page);
  const showFooter = !PAGES_WITHOUT_FOOTER.includes(page);

  return (
    <AuthProvider>
      {showNav && <Navbar onNavigate={navigate} currentPage={page} cartCount={cart.reduce((sum, i) => sum + i.qty, 0)} />}
      
      <main>{renderPage()}</main>
      
      {showFooter && <Footer onNavigate={navigate} />}
      
      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AuthProvider>
  );
};

export default App;
