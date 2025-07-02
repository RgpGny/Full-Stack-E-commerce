import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import {
  createPaymentController,
  getPaymentByIdController,
  getPaymentsByUserController,
  getAllPaymentsController,
  updatePaymentStatusController,
} from "../controllers/paymentController.js";

const router = express.Router();

// Daha spesifik rotaları önce tanımla
router.get(
  "/all-payments",
  authMiddleware,
  roleMiddleware("admin"),
  getAllPaymentsController
);

// Kullanıcılar: Ödeme oluşturma ve kendi ödemelerini görme
router.post("/", authMiddleware, createPaymentController);
router.get("/my-payments", authMiddleware, getPaymentsByUserController);
router.get("/:id", authMiddleware, getPaymentByIdController);

// Admin: Durum güncelleme
router.put(
  "/:id/status",
  authMiddleware,
  roleMiddleware("admin"),
  updatePaymentStatusController
);

export default router;
