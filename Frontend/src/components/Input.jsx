const Input = ({ label, icon: Icon, error, className = "", ...props }) => {
  return (
    <div className={`group ${className}`}>
      {label && (
        <label className="block text-xs font-semibold tracking-widest uppercase text-amber-700/80 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600/60 pointer-events-none">
            <Icon size={16} />
          </span>
        )}
        <input
          {...props}
          className={`w-full bg-amber-50/60 border ${
            error ? "border-red-400" : "border-amber-200 focus:border-amber-500"
          } rounded-xl px-4 ${Icon ? "pl-11" : ""} py-3.5 text-sm text-stone-800 placeholder:text-stone-400
          focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all duration-200
          hover:bg-amber-50 focus:bg-white`}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};

export default Input;
