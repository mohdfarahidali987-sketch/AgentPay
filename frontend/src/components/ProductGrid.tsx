import type { Product } from "../types";
import ProductCard from "./ProductCard";

type ProductGridProps = {
  products: Product[];
  onBuy: (product: Product) => Promise<void>;
  purchaseLoading: boolean;
};

function ProductGrid({
  products,
  onBuy,
  purchaseLoading,
}: ProductGridProps) {

  return (
    <section className="mt-16">

      <div className="mb-6 flex items-end justify-between">

        <div>
          <h3 className="text-xl font-semibold">
            AI Recommendations
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Products selected by the Product Agent
          </p>
        </div>

        <span className="text-sm text-slate-500">
          {products.length} products found
        </span>

      </div>

      {products.length === 0 ? (

        <div className="rounded-2xl border border-dashed border-slate-800 py-16 text-center text-slate-500">
          Ask the AI to find products for you.
        </div>

      ) : (

        <div className="grid gap-6 md:grid-cols-3">

          {products.map((product) => (
           <ProductCard
  key={product.id}
  product={product}
  onBuy={onBuy}
  purchaseLoading={purchaseLoading}
/>
          ))}

        </div>

      )}

    </section>
  );
}

export default ProductGrid;