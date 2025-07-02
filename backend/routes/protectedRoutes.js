import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
const router = express.Router();

router.get("/", authMiddleware, (req, res) => {
  res.json({
    message: "Bu sayfa sadece giriş yapmış kullanıcıya görünür.",
    userId: req.user.id,
  });
});

router.get(
  "/admin-only",
  authMiddleware,
  roleMiddleware("admin"),
  (req, res) => {
    res.status(200).json({ message: "Admin erişimi başarılı!" });
  }
);

export default router;
