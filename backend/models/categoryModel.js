import { db } from "../config/db.js";

export const createCategory = async (category) => {
  const { name } = category;
  const result = await db.query(
    "INSERT INTO categories (name) VALUES ($1) RETURNING *",
    [name]
  );
  return result.rows[0];
};
export const getCategoryById = async (id) => {
  const result = await db.query("SELECT * FROM categories WHERE id = $1", [id]);
  return result.rows[0];
};
export const getAllCategories = async () => {
  const result = await db.query("SELECT * FROM categories");
  return result.rows;
};
export const deleteCategory = async (id) => {
  const result = await db.query(
    "DELETE FROM categories WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};
export const updateCategory = async (id, category) => {
  const { name } = category;
  const result = await db.query(
    "UPDATE categories SET name = $1 WHERE id = $2 RETURNING *",
    [name, id]
  );
  return result.rows[0];
};
export const getProductsByCategory = async (categoryId) => {
  const result = await db.query(
    `SELECT 
       products.id AS product_id, 
       product_categories.category_id, 
       products.name AS product_name
     FROM product_categories
     JOIN products ON product_categories.product_id = products.id
     WHERE product_categories.category_id = $1`,
    [categoryId]
  );
  return result.rows;
};

export const addProductToCategory = async (categoryId, productId) => {
  const result = await db.query(
    "INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2) RETURNING *",
    [productId, categoryId]
  );
  return result.rows[0];
};

export const removeProductFromCategory = async (productId, categoryId) => {
  const result = await db.query(
    "DELETE FROM product_categories WHERE product_id = $1 AND category_id = $2 RETURNING *",
    [productId, categoryId]
  );
  return result.rows[0];
};
