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
import AdminOrdersView from "../views/AdminOrdersView.vue";
import SalesDashboardView from "../views/SalesDashboardView.vue";
import SalesPricingView from "../views/SalesPricingView.vue";
import SalesRefundsView from "../views/SalesRefundsView.vue";
import WishlistView from "../views/WishlistView.vue";
import DealsView from "../views/DealsView.vue";
import ShippingView from "../views/ShippingView.vue";
import ReturnsView from "../views/ReturnsView.vue";
import HelpView from "../views/HelpView.vue";
import AboutView from "../views/AboutView.vue";
import ForgotPasswordView from "../views/ForgotPasswordView.vue";
import ResetPasswordView from "../views/ResetPasswordView.vue";
import ProfileView from "../views/ProfileView.vue";
import { useAuthStore } from "../stores/auth";

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0, behavior: "smooth" };
  },
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
      meta: { requiresAuth: true, roles: ["product_manager"] },
    },
    {
      path: "/admin/orders",
      name: "admin-orders",
      component: AdminOrdersView,
      meta: { requiresAuth: true, roles: ["product_manager"] },
    },
    {
      path: "/sales",
      name: "sales-dashboard",
      component: SalesDashboardView,
      meta: { requiresAuth: true, roles: ["sales_manager"] },
    },
    {
      path: "/sales/refunds",
      name: "sales-refunds",
      component: SalesRefundsView,
      meta: { requiresAuth: true, roles: ["sales_manager"] },
    },
    {
      path: "/sales/pricing",
      name: "sales-pricing",
      component: SalesPricingView,
      meta: { requiresAuth: true, roles: ["sales_manager"] },
    },
    { path: "/shipping", name: "shipping", component: ShippingView },
    { path: "/returns", name: "returns", component: ReturnsView },
    { path: "/help", name: "help", component: HelpView },
    { path: "/about", name: "about", component: AboutView },
    { path: "/profile", name: "profile", component: ProfileView, meta: { requiresAuth: true } },
    { path: "/forgot-password", name: "forgot-password", component: ForgotPasswordView },
    { path: "/reset-password", name: "reset-password", component: ResetPasswordView },
  ],
});

function homeForRole(role) {
  if (role === "product_manager") return "/admin/orders";
  if (role === "sales_manager") return "/sales";
  return "/";
}

router.beforeEach((to) => {
  const { state, isLoggedIn } = useAuthStore();
  if (to.meta.requiresAuth && !isLoggedIn.value) {
    return {
      path: "/login",
      query: { redirect: to.fullPath },
    };
  }
  if (to.meta.roles?.length && !to.meta.roles.includes(state.user?.role)) {
    return homeForRole(state.user?.role);
  }
  return true;
});

export default router;
