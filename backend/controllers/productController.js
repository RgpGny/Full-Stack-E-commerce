import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../models/productModel.js";

export const getAllProductsHandler = async (req, res) => {
  try {
    const { category_id, search, limit, offset } = req.query;
    const products = await getAllProducts({ category_id, search, limit, offset });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getProductByIdHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await getProductById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const createProductHandler = async (req, res) => {
  const productData = req.body;
  try {
    const newProduct = await createProduct(productData);
    res.status(201).json(newProduct);
    if (!newProduct) {
      return res.status(400).json({ message: "Product creation failed" });
    }
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const updateProductHandler = async (req, res) => {
  const { id } = req.params;
  const productData = req.body;
  try {
    const updatedProduct = await updateProduct(id, productData);
    res.status(200).json(updatedProduct);
    if (!updateProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const deleteProductHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProduct = await deleteProduct(id);
    res.status(200).json({ message: "Product deleted successfully" });
    if (deleteProduct === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
