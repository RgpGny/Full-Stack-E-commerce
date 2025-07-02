import {
  createOrder,
  getOrderById,
  getOrdersByUser,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} from "../models/orderModel.js";

export const createOrderController = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }
    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({
          message: "Each item must have a valid product_id and quantity",
        });
      }
    }
    const newOrder = await createOrder(req.user.id, items); // req.user.id kullanıldı
    res
      .status(201)
      .json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderByIdController = async (req, res) => {
  try {
    const order = await getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    // Kullanıcı sadece kendi siparişini görebilir, admin her şeyi görebilir
    if (req.user.role !== "admin" && order.user_id !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to view this order" });
    }
    res.status(200).json({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getOrderByUserController = async (req, res) => {
  try {
    const userId = req.user.id; // req.user.id kullanıldı
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const orders = await getOrdersByUser(userId); // getOrdersByUser kullanıldı
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }
    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching order by user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await getAllOrders();
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }
    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateOrderStatusController = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "shipped", "delivered", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const order = await updateOrderStatus(req.params.id, status);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res
      .status(200)
      .json({ message: "Order status updated successfully", order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteOrderController = async (req, res) => {
  try {
    const order = await deleteOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
