import HomeView from "../HomeView.vue";
import ProductDetail from "../ProductDetail.vue";
import CartView from "../CartView.vue";
import CheckoutView from "../CheckoutView.vue";
import LoginView from "../LoginView.vue";
import RegisterView from "../RegisterView.vue";
import OrdersView from "../OrdersView.vue";
import OrderDetailView from "../OrderDetailView.vue";
import AdminReviewsView from "../AdminReviewsView.vue";
import WishlistView from "../WishlistView.vue";
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
      path: "/admin/reviews",
      name: "admin-reviews",
      component: AdminReviewsView,
    },
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
