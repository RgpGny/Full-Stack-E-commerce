import { db } from "../config/db.js";

export const createOrder = async (userId, items) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Sipariş oluştur
    const orderResult = await client.query(
      "INSERT INTO orders (user_id, total_price, status) VALUES ($1, $2, $3) RETURNING *",
      [userId, 0, "pending"]
    );
    const order = orderResult.rows[0];

    // Sipariş kalemlerini ekle ve toplam fiyatı hesapla
    let totalPrice = 0;
    for (const item of items) {
      const { product_id, quantity } = item;
      // Ürün fiyatını al
      const productResult = await client.query(
        "SELECT price FROM products WHERE id = $1",
        [product_id]
      );
      if (!productResult.rows[0]) {
        throw new Error(`Product with ID ${product_id} not found`);
      }
      const unitPrice = productResult.rows[0].price;
      const itemTotal = unitPrice * quantity;
      totalPrice += itemTotal;

      // Sipariş kalemini ekle (quantity kullanıcıdan gelen değer)
      await client.query(
        "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)",
        [order.id, product_id, quantity, unitPrice]
      );
    }

    // Siparişin toplam fiyatını güncelle
    const updatedOrderResult = await client.query(
      "UPDATE orders SET total_price = $1 WHERE id = $2 RETURNING *",
      [totalPrice, order.id]
    );

    await client.query("COMMIT");
    return updatedOrderResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getOrderById = async (orderId) => {
  const orderResult = await db.query("SELECT * FROM orders WHERE id = $1", [
    orderId,
  ]);
  if (!orderResult.rows[0]) {
    throw new Error(`Order with ID ${orderId} not found`);
  }
  const itemsResult = await db.query(
    "SELECT * FROM order_items WHERE order_id = $1",
    [orderId]
  );
  if (!itemsResult.rows.length) {
    throw new Error(`No items found for order with ID ${orderId}`);
  }
  return {
    order: orderResult.rows[0],
    items: itemsResult.rows,
  };
};

export const getOrdersByUser = async (userId) => {
  const orderResult = await db.query(
    "SELECT * FROM orders WHERE user_id = $1",
    [userId]
  );
  if (!orderResult.rows.length) {
    throw new Error(`No orders found for user with ID ${userId}`);
  }
  const orders = orderResult.rows;
  for (let order of orders) {
    const itemsResult = await db.query(
      "SELECT * FROM order_items WHERE order_id = $1",
      [order.id]
    );
    if (!itemsResult.rows.length) {
      throw new Error(`No items found for order with ID ${order.id}`);
    }
    order.items = itemsResult.rows;
  }
  return orders;
};

export const getAllOrders = async () => {
  const orderResult = await db.query("SELECT * FROM orders");
  if (!orderResult.rows.length) {
    throw new Error("No orders found");
  }
  const orders = orderResult.rows;
  for (let order of orders) {
    const itemsResult = await db.query(
      "SELECT * FROM order_items WHERE order_id = $1",
      [order.id]
    );
    if (!itemsResult.rows.length) {
      throw new Error(`No items found for order with ID ${order.id}`);
    }
    order.items = itemsResult.rows;
  }
  return orders;
};

export const updateOrderStatus = async (orderId, status) => {
  const orderResult = await db.query(
    "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
    [status, orderId]
  );
  if (!orderResult.rows[0]) {
    throw new Error(`Order with ID ${orderId} not found`);
  }
  return orderResult.rows[0];
};

export const deleteOrder = async (orderId) => {
  const orderResult = await db.query(
    "DELETE FROM orders WHERE id = $1 RETURNING *",
    [orderId]
  );
  if (!orderResult.rows[0]) {
    throw new Error(`Order with ID ${orderId} not found`);
  }
  return orderResult.rows[0];
};
