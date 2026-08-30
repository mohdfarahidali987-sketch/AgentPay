import type { Product } from "../types";
import ProductCard from "./ProductCard";

type ProductGridProps = {
  products: Product[];
  onBuy: (product: Product) => Promise<void>;

  // ID of the product currently being purchased.
  // null means no purchase is currently processing.
  
  processingProductId: string | null;
};

function ProductGrid({
  products,
  onBuy,
  processingProductId,
}: ProductGridProps) {
  return (
    <section className="mt-16">

 
      {/* SECTION HEADER */}
 

      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>

          <div className="flex items-center gap-2">

            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
              ✦
            </span>

            <h3 className="text-xl font-semibold text-white">
              AI Recommendations
            </h3>

          </div>

          <p className="mt-2 text-sm text-slate-500">
            Products selected and ranked by the Product Agent
          </p>

        </div>


        {/* Product count */}

        {products.length > 0 && (
          <div className="flex items-center gap-2 self-start rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-400 sm:self-auto">

            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />

            {products.length}{" "}
            {products.length === 1
              ? "product"
              : "products"}{" "}
            found

          </div>
        )}

      </div>


   
      {/* EMPTY STATE */}
     

      {products.length === 0 ? (

        <div className="relative overflow-hidden rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 px-6 py-20 text-center">

          {/* Background glow */}

          <div className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/5 blur-3xl" />


          <div className="relative">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-2xl">
              ✦
            </div>


            <h4 className="mt-5 font-semibold text-slate-300">
              Your recommendations will appear here
            </h4>


            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              Tell the AI what you're looking for and the Product
              Agent will find and rank the best matching products.
            </p>

          </div>

        </div>

      ) : (

        <>

       
          {/* RANKING CONTEXT */}
    

          <div className="mb-5 flex items-center gap-2 text-xs text-slate-600">

            <span className="text-violet-400">
              ✦
            </span>

            <span>
              Ranked according to your request and preferences
            </span>

          </div>


       
          {/* PRODUCT CARDS */} 
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {products.map((product) => (

              <ProductCard
                key={product.id}

                product={product}

                onBuy={onBuy}

                /*
                 * Only the clicked product gets
                 * purchaseLoading = true.
                 */
                purchaseLoading={
                  processingProductId === product.id
                }

                /*
                 * Used to disable the other buy buttons
                 * while one purchase is being processed.
                 */
                anyPurchaseProcessing={
                  processingProductId !== null
                }
              />

            ))}

          </div>

        </>

      )}

    </section>
  );
}

export default ProductGrid;