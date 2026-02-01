import express from "express";
import { AuthRoutes } from "../modules/Auth/auth.route";
import { CategoryRoutes } from "../modules/Category/category.route";
import { MedicineRoutes } from "../modules/Medicine/medicine.route";
import { AdminRoutes } from "../modules/Admin/admin.route";
import { OrderRoutes } from "../modules/Order/order.route";
import { CartRoutes } from "../modules/Cart/cart.route";
import { UserRoutes } from "../modules/User/user.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/categories",
    route: CategoryRoutes,
  },
  {
    path: "/medicines",
    route: MedicineRoutes,
  },
  {
    path: "/admin",
    route: AdminRoutes,
  },
  {
    path: "/orders",
    route: OrderRoutes,
  },
  {
    path: "/cart",
    route: CartRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
