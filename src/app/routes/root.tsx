import { RootLayout } from "../layouts/root-layout";
import { homeRoute } from "./home";
import { shopRoute } from "./shop";
import { productDetailRoute } from "./product-detail";
import { cartRoute } from "./cart";
import { checkoutRoute } from "./checkout";

export const rootRoute = {
  path: "/",
  Component: RootLayout,
  children: [
    homeRoute,
    shopRoute,
    productDetailRoute,
    cartRoute,
    checkoutRoute,
  ],
};
