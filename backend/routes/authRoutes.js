import express from "express";
import {
  register,
  login,
  refreshToken,
  logoutUser,
  checkAuth,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateRegistration } from "../middleware/validationMiddleware.js";
import { loginRateLimit } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

router.post("/register", validateRegistration, register);
router.post("/login", loginRateLimit, login);
router.post("/refresh-token", refreshToken);
router.get("/check", authMiddleware, checkAuth);
router.post("/logout", logoutUser);

export default router;
