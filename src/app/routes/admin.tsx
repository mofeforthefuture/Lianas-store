import { AdminLayout } from "../layouts/admin-layout";
import { AdminDashboardPage } from "../pages/admin-dashboard-page";
import { AdminProductsPage } from "../pages/admin-products-page";
import { AdminOrdersPage } from "../pages/admin-orders-page";
import { AdminProductFormPage } from "../pages/admin-product-form-page";

export const adminRoute = {
  path: "admin",
  Component: AdminLayout,
  children: [
    { index: true, Component: AdminDashboardPage },
    { path: "products", Component: AdminProductsPage },
    { path: "products/:id", Component: AdminProductFormPage },
    { path: "orders", Component: AdminOrdersPage },
  ],
};
