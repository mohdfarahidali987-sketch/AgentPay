import type { Product } from "../types";

type ProductCardProps = {
  product: Product;
  onBuy: (product: Product) => Promise<void>;
  purchaseLoading: boolean;
  anyPurchaseProcessing: boolean;
};

function ProductCard({
  product,
  onBuy,
  purchaseLoading,
  anyPurchaseProcessing,
}: ProductCardProps) {
  const getIcon = () => {
    const name = product.name.toLowerCase();

    if (name.includes("mouse")) return "🖱️";
    if (name.includes("hub")) return "🔌";
    if (name.includes("keyboard")) return "⌨️";
    if (name.includes("headphone")) return "🎧";
    if (name.includes("webcam")) return "📷";
    if (name.includes("power bank")) return "🔋";
    if (name.includes("monitor")) return "🖥️";
    if (name.includes("laptop")) return "💻";
    if (name.includes("phone")) return "📱";
    if (name.includes("charger")) return "🔋";

    return "📦";
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-950/20">

      {/* ================================================= */}
      {/* AI MATCH BADGE */}
      {/* ================================================= */}

      <div className="absolute left-5 top-5 z-10">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-slate-950/80 px-3 py-1.5 text-xs font-medium text-violet-300 shadow-lg backdrop-blur-md">
          <span className="text-violet-400">✦</span>
          AI Match
        </span>
      </div>


      {/* ================================================= */}
      {/* PRODUCT VISUAL */}
      {/* ================================================= */}

      <div className="relative m-3 overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 via-slate-850 to-slate-950">

        {/* Background glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-3xl transition-all duration-500 group-hover:bg-violet-600/20" />

        {/* Product icon */}
        <div className="relative flex h-48 items-center justify-center text-7xl transition-transform duration-500 group-hover:scale-110">
          {getIcon()}
        </div>


        {/* Stock status */}
        <div className="absolute bottom-3 right-3">

          {isOutOfStock ? (
            <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 backdrop-blur-md">
              Out of stock
            </span>
          ) : (
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 backdrop-blur-md">
              {product.stock} available
            </span>
          )}

        </div>

      </div>


      {/* ================================================= */}
      {/* PRODUCT CONTENT */}
      {/* ================================================= */}

      <div className="flex flex-1 flex-col px-5 pb-5 pt-2">

        {/* Category + rating */}

        <div className="flex items-center justify-between gap-3">

          <span className="rounded-md bg-slate-800/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            {product.category}
          </span>


          <div className="flex items-center gap-1">

            <span className="text-sm text-yellow-400">
              ★
            </span>

            <span className="text-sm font-medium text-slate-300">
              {product.rating.toFixed(1)}
            </span>

            <span className="text-xs text-slate-600">
              ({product.reviewCount.toLocaleString()})
            </span>

          </div>

        </div>


        {/* ================================================= */}
        {/* PRODUCT NAME */}
        {/* ================================================= */}

        <div className="mt-4">

          <h4 className="min-h-[3.5rem] text-lg font-semibold leading-7 text-white transition-colors duration-200 group-hover:text-violet-300">
            {product.name}
          </h4>

          {product.brand && (
            <p className="mt-1 text-xs font-medium text-slate-600">
              by {product.brand}
            </p>
          )}

        </div>


        {/* ================================================= */}
        {/* DESCRIPTION */}
        {/* ================================================= */}

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
          {product.description}
        </p>


        {/* ================================================= */}
        {/* AI RANKING REASON */}
        {/* ================================================= */}

        {product.rankingReasons &&
          product.rankingReasons.length > 0 && (

            <div className="mt-5 rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-transparent p-4">

              {/* Header */}

              <div className="flex items-center gap-2">

                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 text-sm">
                  ✦
                </div>

                <div>
                  <p className="text-xs font-semibold text-violet-300">
                    AI Recommendation
                  </p>

                  <p className="text-[10px] text-slate-600">
                    Why this product ranked highly
                  </p>
                </div>

              </div>


              {/* Reasons */}

              <div className="mt-3 space-y-2">

                {product.rankingReasons.map(
                  (reason, index) => (

                    <div
                      key={index}
                      className="flex items-start gap-2"
                    >

                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] text-emerald-400">
                        ✓
                      </span>

                      <span className="text-xs leading-5 text-slate-400">
                        {reason}
                      </span>

                    </div>

                  )
                )}

              </div>

            </div>
          )}


        {/* ================================================= */}
        {/* PRICE + PURCHASE */}
        {/* ================================================= */}

        <div className="mt-auto pt-6">

          <div className="mb-4 flex items-end justify-between">

            <div>

              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
                Price
              </p>

              <p className="mt-1 text-2xl font-bold tracking-tight text-white">
                ₹{product.price.toLocaleString("en-IN")}
              </p>

            </div>


            {!isOutOfStock && (
              <div className="flex items-center gap-1.5 pb-1">

                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                <span className="text-xs text-emerald-400">
                  In stock
                </span>

              </div>
            )}

          </div>


          {/* ================================================= */}
          {/* BUY BUTTON */}
          {/* ================================================= */}

          <button
            onClick={() => onBuy(product)}
              disabled={anyPurchaseProcessing}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/20 transition-all duration-200 hover:bg-violet-500 hover:shadow-violet-900/30 disabled:cursor-not-allowed disabled:opacity-40"
          >

            {purchaseLoading ? (

              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Processing...
              </>

            ) : isOutOfStock ? (

              "Out of stock"

            ) : (

              <>
                <span className="text-sm">
                  ✦
                </span>

                Buy with AI

                <span className="ml-auto text-lg">
                  →
                </span>
              </>

            )}

          </button>

        </div>

      </div>

    </article>
  );
}

export default ProductCard;