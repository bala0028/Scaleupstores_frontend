/**
 * Soft gradient hero panel for the admin sign-in screen: blurred pastel
 * backdrop, a glossy 3D orb, and a two-line headline the orb overlaps.
 */
export function GradientOrbArt({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-[#efe7f7] ${className ?? ""}`}>
      {/* pastel blurred backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 -left-16 h-72 w-72 rounded-full bg-indigo-300/50 blur-3xl" />
        <div className="absolute top-1/4 -right-20 h-80 w-80 rounded-full bg-fuchsia-300/50 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-sky-300/40 blur-3xl" />
        <div className="absolute bottom-10 right-1/4 h-56 w-56 rounded-full bg-purple-300/40 blur-3xl" />
      </div>

      <div className="relative flex h-full flex-col justify-between px-10 py-12 sm:px-14 sm:py-16">
        {/* headline + orb */}
        <div className="relative flex flex-1 items-center justify-center">
          <div className="relative w-full max-w-xs text-center">
            <p className="select-none text-4xl font-extrabold uppercase leading-tight tracking-tight text-white drop-shadow-sm sm:text-5xl">
              Store
            </p>

            {/* glossy orb */}
            <div className="relative z-10 mx-auto -my-3 h-28 w-28 sm:h-32 sm:w-32">
              <div
                aria-hidden
                className="absolute inset-0 rounded-full shadow-[0_20px_45px_-12px_rgba(219,39,119,0.55)]"
                style={{
                  background:
                    "radial-gradient(circle at 32% 28%, #ffe4f1 0%, #f472b6 28%, #db2777 62%, #831843 100%)",
                }}
              />
              <div
                aria-hidden
                className="absolute left-[18%] top-[14%] h-[30%] w-[34%] rounded-full bg-white/80 blur-[3px]"
              />
              <div
                aria-hidden
                className="absolute -bottom-3 left-1/2 h-4 w-20 -translate-x-1/2 rounded-full bg-fuchsia-900/25 blur-md"
              />
            </div>

            <p className="select-none text-4xl font-extrabold uppercase leading-tight tracking-tight text-white drop-shadow-sm sm:text-5xl">
              Control
            </p>
          </div>
        </div>

        {/* supporting copy */}
        <div className="relative z-10 text-left">
          <h2 className="text-xl font-bold text-gray-900">Powerful Admin Control</h2>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-gray-600">
            Manage products, orders, and customers from one unified dashboard
            built for speed and clarity.
          </p>

          <div className="mt-5 inline-flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-2.5 shadow-sm backdrop-blur-sm">
            <div aria-hidden className="flex -space-x-2.5">
              {["bg-fuchsia-400", "bg-purple-400", "bg-sky-400"].map((c, i) => (
                <span
                  key={i}
                  className={`h-7 w-7 rounded-full border-2 border-white ${c}`}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-gray-600">
              Trusted by growing stores
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GradientOrbArt;
