import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import ProductDetail from "../views/ProductDetail.vue";
import CartView from "../views/CartView.vue";
import CheckoutView from "../views/CheckoutView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import OrdersView from "../views/OrdersView.vue";
import OrderDetailView from "../views/OrderDetailView.vue";
import AdminReviewsView from "../views/AdminReviewsView.vue";
import WishlistView from "../views/WishlistView.vue";
import DealsView from "../views/DealsView.vue";
import ShippingView from "../views/ShippingView.vue";
import ReturnsView from "../views/ReturnsView.vue";
import HelpView from "../views/HelpView.vue";
import AboutView from "../views/AboutView.vue";
import { useAuthStore } from "../stores/auth";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/product/:id",
      name: "product-detail",
      component: ProductDetail,
    },
    {
      path: "/cart",
      name: "cart",
      component: CartView,
    },
    {
      path: "/wishlist",
      name: "wishlist",
      component: WishlistView,
    },
    {
      path: "/checkout",
      name: "checkout",
      component: CheckoutView,
      meta: { requiresAuth: true },
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/register",
      name: "register",
      component: RegisterView,
    },
    {
      path: "/orders",
      name: "orders",
      component: OrdersView,
      meta: { requiresAuth: true },
    },
    {
      path: "/orders/:id",
      name: "order-detail",
      component: OrderDetailView,
      meta: { requiresAuth: true },
    },
    {
      path: "/deals",
      name: "deals",
      component: DealsView,
    },
    {
      path: "/admin/reviews",
      name: "admin-reviews",
      component: AdminReviewsView,
    },
    { path: "/shipping", name: "shipping", component: ShippingView },
    { path: "/returns", name: "returns", component: ReturnsView },
    { path: "/help", name: "help", component: HelpView },
    { path: "/about", name: "about", component: AboutView },
  ],
});

router.beforeEach((to) => {
  const { isLoggedIn } = useAuthStore();
  if (to.meta.requiresAuth && !isLoggedIn.value) {
    return {
      path: "/login",
      query: { redirect: to.fullPath },
    };
  }
  return true;
});

export default router;
