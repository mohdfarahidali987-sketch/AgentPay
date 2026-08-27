import type { Product } from "../types";

type ProductCardProps = {
  product: Product;
  onBuy: (product: Product) => Promise<void>;
  purchaseLoading: boolean;
};

function ProductCard({
  product,
  onBuy,
  purchaseLoading,
}: ProductCardProps) {

  const getIcon = () => {
    if (product.name.includes("Mouse")) return "🖱️";
    if (product.name.includes("Hub")) return "🔌";
    if (product.name.includes("Keyboard")) return "⌨️";
    if (product.name.includes("Headphones")) return "🎧";
    if (product.name.includes("Webcam")) return "📷";
    if (product.name.includes("Power Bank")) return "🔋";

    return "💻";
  };

  return (
    <div className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-violet-500/50">

      {/* Product Image */}
      <div className="flex h-40 items-center justify-center rounded-xl bg-slate-800 text-6xl">
        {getIcon()}
      </div>

      <div className="mt-5">

        {/* Product name + rating */}
        <div className="flex items-start justify-between gap-4">

          <div>
            <h4 className="font-semibold">
              {product.name}
            </h4>

            {product.brand && (
              <p className="mt-1 text-xs text-slate-500">
                {product.brand}
              </p>
            )}
          </div>

          <div className="shrink-0 text-right">

            <span className="text-sm text-yellow-400">
              ★ {product.rating}
            </span>

            <p className="text-xs text-slate-500">
              {product.reviewCount.toLocaleString()} reviews
            </p>

          </div>

        </div>

        {/* Description */}
        <p className="mt-3 text-sm text-slate-500">
          {product.description}
        </p>

        {/* Agent explanation */}
        {product.rankingReasons &&
          product.rankingReasons.length > 0 && (

          <div className="mt-5 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">

            <div className="flex items-center gap-2">

              <span className="text-lg">
                🤖
              </span>

              <h5 className="text-sm font-semibold text-violet-300">
                Why AgentPay recommends this
              </h5>

            </div>

            <div className="mt-3 space-y-2">

              {product.rankingReasons.map(
                (reason, index) => (

                  <div
                    key={index}
                    className="flex items-start gap-2 text-xs text-slate-300"
                  >

                    <span className="mt-0.5 text-emerald-400">
                      ✓
                    </span>

                    <span>
                      {reason}
                    </span>

                  </div>

                )
              )}

            </div>

          </div>

        )}

        {/* Price + stock + buy */}
        <div className="mt-5 flex items-center justify-between">

          <div>

            <p className="text-2xl font-bold">
              ₹{product.price}
            </p>

            <p className="text-xs text-emerald-400">
              {product.stock} in stock
            </p>

          </div>

          <button
            onClick={() => onBuy(product)}
            disabled={purchaseLoading}
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {purchaseLoading
              ? "Processing..."
              : "Buy with AI"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default ProductCard;