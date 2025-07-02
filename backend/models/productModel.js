import { db } from "../config/db.js";

export const getAllProducts = async (filters = {}) => {
  const { category_id, search, limit, offset } = filters;
  
  let query = `
    SELECT DISTINCT p.*, c.name as category_name 
    FROM products p
    LEFT JOIN product_categories pc ON p.id = pc.product_id
    LEFT JOIN categories c ON pc.category_id = c.id
    WHERE 1=1
  `;
  
  const queryParams = [];
  let paramIndex = 1;

  // Kategori filtresi
  if (category_id) {
    query += ` AND pc.category_id = $${paramIndex}`;
    queryParams.push(category_id);
    paramIndex++;
  }

  // Arama filtresi
  if (search && search.trim()) {
    query += ` AND (
      LOWER(p.name) LIKE LOWER($${paramIndex}) OR 
      LOWER(p.description) LIKE LOWER($${paramIndex})
    )`;
    queryParams.push(`%${search.trim()}%`);
    paramIndex++;
  }

  // Sıralama
  query += ` ORDER BY p.created_at DESC`;

  // Limit ve Offset
  if (limit) {
    query += ` LIMIT $${paramIndex}`;
    queryParams.push(parseInt(limit));
    paramIndex++;
  }

  if (offset) {
    query += ` OFFSET $${paramIndex}`;
    queryParams.push(parseInt(offset));
  }

  try {
    const result = await db.query(query, queryParams);
    return result.rows;
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Failed to fetch products");
  }
};

export const getProductById = async (id) => {
  const result = await db.query("SELECT * FROM products WHERE id=$1", [id]);
  if (result.rows.length === 0) {
    throw new Error("Product not found");
  }
  return result.rows[0];
};

export const createProduct = async (productData) => {
  const { name, description, price, stock, image_url } = productData;
  const result = await db.query(
    "INSERT INTO products (name, description, price, stock, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [name, description, price, stock, image_url]
  );
  if (result.rows.length === 0) {
    throw new Error("Product creation failed");
  }
  return result.rows[0];
};

export const updateProduct = async (id, productData) => {
  const fields = Object.keys(productData);
  const values = Object.values(productData);

  if (fields.length === 0) {
    throw new Error("Güncellenecek alan yok.");
  }

  const setClause = fields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(", ");

  const query = `
    UPDATE products
    SET ${setClause}
    WHERE id = $${fields.length + 1}
    RETURNING *;
  `;
  const result = await db.query(query, [...values, id]);

  if (result.rows.length === 0) {
    throw new Error("Product not found");
  }

  return result.rows[0];
};

export const deleteProduct = async (id) => {
  const result = await db.query(
    "DELETE FROM products WHERE id=$1 RETURNING *",
    [id]
  );
  if (result.rows.length === 0) {
    throw new Error("Product not found");
  }
  return result.rows[0];
};
