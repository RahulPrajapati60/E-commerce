const Footer = ({ onNavigate }) => {
  const links = {
    Shop: ["Sarees", "Jewellery", "Shawls", "Apparel", "Décor", "Art"],
    Company: ["About Us", "Artisans", "Blog", "Careers"],
    Support: ["Shipping", "Returns", "FAQ", "Contact"],
  };

  return (
    <footer className="bg-stone-900 text-stone-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2">
            <button onClick={() => onNavigate("home")} className="flex items-center gap-2.5 mb-4 group">
              <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-white font-black text-lg">ऊ</span>
              </div>
              <span className="text-white font-black text-xl">Utsav<span className="font-light text-amber-500">.in</span></span>
            </button>
            <p className="text-stone-500 text-xs leading-relaxed max-w-xs mb-5">
              India's premier platform for authentic handcrafted goods. Every purchase empowers an artisan family.
            </p>
            <div className="flex gap-2">
              {["Facebook", "Instagram", "Twitter", "Pinterest"].map((s) => (
                <button key={s} className="w-8 h-8 bg-stone-800 rounded-lg flex items-center justify-center hover:bg-amber-600 transition-colors text-stone-400 hover:text-white text-xs font-bold">
                  {s[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <p className="text-white font-bold text-sm mb-4">{section}</p>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <button className="text-xs text-stone-500 hover:text-amber-400 transition-colors">
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-stone-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-stone-600">© 2025 Utsav.in — Made with ♥ in Bharat</p>
          <div className="flex items-center gap-4 text-xs text-stone-600">
            <button className="hover:text-stone-400 transition-colors">Privacy Policy</button>
            <button className="hover:text-stone-400 transition-colors">Terms of Service</button>
            <button className="hover:text-stone-400 transition-colors">Cookie Policy</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
