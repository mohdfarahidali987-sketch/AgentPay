import { Router } from "express";
import {
  getAllProducts,
  getProductById,
  searchProducts,
} from "../services/product.services.js";

const router = Router();

 
 // Get all products or search products.
 
router.get("/", async (req, res) => {
  try {
    const search = req.query.search as string | undefined;

    const maxPriceRaw = req.query.maxPrice as string | undefined;

    const maxPrice = maxPriceRaw
      ? Number(maxPriceRaw)
      : undefined;

    if (maxPriceRaw && Number.isNaN(maxPrice)) {
      return res.status(400).json({
        message: "maxPrice must be a valid number",
      });
    }

    const products = search
      ? await searchProducts(search, maxPrice)
      : await getAllProducts();

    return res.json({
      products,
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);

    return res.status(500).json({
      message: "Failed to fetch products",
    });
  }
});

/**
 * GET /api/products/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const product = await getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.json({
      product,
    });
  } catch (error) {
    console.error("Failed to fetch product:", error);

    return res.status(500).json({
      message: "Failed to fetch product",
    });
  }
});

export default router;