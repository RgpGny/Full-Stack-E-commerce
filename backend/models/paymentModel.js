import { db } from "../config/db.js";

export const createPayment = async (orderId, paymentMethod) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const orderResult = await client.query("SELECT* FROM orders WHERE id=$1", [
      orderId,
    ]);
    if (orderResult.rows.length === 0) {
      throw new Error("Order not found");
    }
    const newPayment = await client.query(
      "INSERT INTO payments(order_id, payment_method, payment_status,paid_at) VALUES ($1, $2,$3,$4) RETURNING *",
      [orderId, paymentMethod, "pending", null]
    );
    await client.query("COMMIT");
    return newPayment.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating payment:", error);
    throw error;
  }
};
export const getPaymentById = async (paymentId) => {
  const payment = await db.query("SELECT * FROM payments WHERE id=$1", [
    paymentId,
  ]);
  if (payment.rows.length === 0) {
    throw new Error("Payment not found");
  }
  return payment.rows[0];
};
export const getPaymentsByUser = async (userId) => {
  const payments = await db.query("SELECT * FROM payments WHERE user_id=$1", [
    userId,
  ]);
  if (payments.rows.length === 0) {
    throw new Error("No payments found for this user");
  }
  return payments.rows;
};
export const getAllPayments = async () => {
  const allPayments = await db.query("SELECT * FROM payments");
  if (allPayments.rows.length === 0) {
    throw new Error("No payments found");
  }
  return allPayments.rows;
};
export const updatePaymentStatus = async (id, status) => {
  const payment = await db.query(
    "UPDATE payments SET payment_status=$1, paid_at=NOW() WHERE id=$2 RETURNING *",
    [status, id]
  );
  if (payment.rows.length === 0) {
    throw new Error("Payment not found");
  }
  return payment.rows[0];
};
