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
    return "💻";
  };

  return (
    <div className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-violet-500/50">

      <div className="flex h-40 items-center justify-center rounded-xl bg-slate-800 text-6xl">
        {getIcon()}
      </div>

      <div className="mt-5">

        <div className="flex items-center justify-between">

          <h4 className="font-semibold">
            {product.name}
          </h4>

          <span className="text-sm text-yellow-400">
            ★ {product.rating}
          </span>

        </div>

        <p className="mt-2 text-sm text-slate-500">
          {product.description}
        </p>

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
  {purchaseLoading ? "Processing..." : "Buy with AI"}
</button>

        </div>

      </div>

    </div>
  );
}

export default ProductCard;