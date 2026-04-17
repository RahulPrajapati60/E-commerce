const variants = {
  primary:
    "bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 shadow-lg shadow-amber-500/25 active:scale-[0.98]",
  outline:
    "border border-amber-600 text-amber-700 hover:bg-amber-50 active:scale-[0.98]",
  ghost:
    "text-amber-700 hover:bg-amber-50 active:scale-[0.98]",
};

const Button = ({
  children,
  variant = "primary",
  loading = false,
  className = "",
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`relative flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm
      tracking-wide transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
      ${variants[variant]} ${className}`}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </span>
      )}
      <span className={loading ? "opacity-0" : ""}>{children}</span>
    </button>
  );
};

export default Button;
