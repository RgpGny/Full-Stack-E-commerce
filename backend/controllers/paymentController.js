import {
  createPayment,
  getPaymentById,
  getPaymentsByUser,
  getAllPayments,
  updatePaymentStatus,
} from "../models/paymentModel.js";
import { db } from "../config/db.js";

export const createPaymentController = async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body;
    if (!orderId || !paymentMethod) {
      return res
        .status(400)
        .json({ message: "Order ID and payment method are required" });
    }
    if (
      !["credit_card", "debit_card", "paypal", "bank_transfer"].includes(
        paymentMethod
      )
    ) {
      return res.status(400).json({ message: "Invalid payment method" });
    }
    // Siparişin kullanıcıya ait olduğunu kontrol et
    const orderResult = await db.query(
      "SELECT user_id FROM orders WHERE id = $1",
      [orderId]
    );
    if (!orderResult.rows[0]) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (
      req.user.role !== "admin" &&
      orderResult.rows[0].user_id !== req.user.id
    ) {
      return res
        .status(403)
        .json({ message: "Unauthorized to create payment for this order" });
    }
    const payment = await createPayment(orderId, paymentMethod);
    res.status(201).json({ message: "Payment created successfully", payment });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const getPaymentByIdController = async (req, res) => {
  try {
    const payment = await getPaymentById(req.params.id);
    // Ödemenin bağlı olduğu siparişin kullanıcıya ait olduğunu kontrol et
    const orderResult = await db.query(
      "SELECT user_id FROM orders WHERE id = $1",
      [payment.order_id]
    );
    if (!orderResult.rows[0]) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (
      req.user.role !== "admin" &&
      orderResult.rows[0].user_id !== req.user.id
    ) {
      return res
        .status(403)
        .json({ message: "Unauthorized to view this payment" });
    }
    res.status(200).json({ payment });
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const getPaymentsByUserController = async (req, res) => {
  try {
    const payments = await getPaymentsByUser(req.user.id);
    res.status(200).json({ payments });
  } catch (error) {
    console.error("Error fetching payments by user:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const getAllPaymentsController = async (req, res) => {
  try {
    const payments = await getAllPayments();
    res.status(200).json({ payments });
  } catch (error) {
    console.error("Error fetching all payments:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const updatePaymentStatusController = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "completed", "failed"].includes(status)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }
    const payment = await updatePaymentStatus(req.params.id, status);

    const orderResult = await db.query(
      "SELECT user_id FROM orders WHERE id = $1",
      [payment.order_id]
    );
    if (!orderResult.rows[0]) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (
      req.user.role !== "admin" &&
      orderResult.rows[0].user_id !== req.user.id
    ) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this payment" });
    }
    res
      .status(200)
      .json({ message: "Payment status updated successfully", payment });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};
