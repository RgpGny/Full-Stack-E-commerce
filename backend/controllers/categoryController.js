import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  addProductToCategory,
  removeProductFromCategory,
  getProductsByCategory,
} from "../models/categoryModel.js";

export const createCategoryHandler = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }
  try {
    const newCategory = await createCategory(name);
    if (!newCategory) {
      return res.status(400).json({ message: "Category creation failed" });
    }
    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getAllCategoriesHandler = async (req, res) => {
  try {
    const categories = await getAllCategories();
    if (!categories) {
      return res.status(404).json({ message: "No categories found" });
    }
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getCategoryByIdHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const selectedCategory = await getCategoryById(id);
    if (!selectedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    return res.status(200).json(selectedCategory);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const updateCategoryHandler = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid category ID" });
  }
  try {
    const updatedCategory = await updateCategory(id, name);
    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const deleteCategoryHandler = async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid category ID" });
  }
  try {
    const deletedCategory = await deleteCategory(id);
    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(deletedCategory);
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const addProductToCategoryHandler = async (req, res) => {
  const { categoryId, productId } = req.params;
  if (!categoryId || !productId) {
    return res
      .status(400)
      .json({ message: "Category ID and Product ID are required" });
  }
  try {
    const updatedProduct = await addProductToCategory(categoryId, productId);
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product or Category not found" });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error adding product to category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const removeProductFromCategoryHandler = async (req, res) => {
  const { productId } = req.params;
  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }
  try {
    const updatedProduct = await removeProductFromCategory(productId);
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error removing product from category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getProductsByCategoryHandler = async (req, res) => {
  const { categoryId } = req.params;
  if (isNaN(categoryId)) {
    return res.status(400).json({ message: "Invalid category ID" });
  }
  try {
    const products = await getProductsByCategory(categoryId);
    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found in this category" });
    }
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
