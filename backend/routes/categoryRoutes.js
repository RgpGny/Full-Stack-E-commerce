import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import {
  createCategoryHandler,
  getAllCategoriesHandler,
  getCategoryByIdHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
  addProductToCategoryHandler,
  removeProductFromCategoryHandler,
  getProductsByCategoryHandler,
} from "../controllers/categoryController.js";

const router = express.Router();

// USERS
router.get("/", getAllCategoriesHandler);
router.get("/:id", getCategoryByIdHandler);
router.get("/:categoryId/products", getProductsByCategoryHandler);

// ADMİN
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  createCategoryHandler
);
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateCategoryHandler
);
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteCategoryHandler
);

router.post(
  "/product",
  authMiddleware,
  roleMiddleware("admin"),
  addProductToCategoryHandler
);
router.delete(
  "/product",
  authMiddleware,
  roleMiddleware("admin"),
  removeProductFromCategoryHandler
);

export default router;
