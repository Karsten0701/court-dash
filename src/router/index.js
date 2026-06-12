import { createRouter, createWebHistory } from "vue-router";
import authService from "@/services/authService.js";
import appConfig from "@/config/appConfig.js";

const Dashboard = () => import("@/pages/Dashboard.vue");
const Players = () => import("@/pages/Players.vue");
const Games = () => import("@/pages/Games.vue");
const ApiStatus = () => import("@/pages/ApiStatus.vue");
const Login = () => import("@/pages/Login.vue");
const FeaturesLanding = () => import("@/pages/FeaturesLanding.vue");
const PricingLanding = () => import("@/pages/PricingLanding.vue");
const ContactLanding = () => import("@/pages/ContactLanding.vue");
const NotFound = () => import("@/pages/NotFound.vue");

const adminMeta = (title) => ({
  title,
  requiresAuth: true,
  requiresAdmin: true,
});

const routes = [
  {
    path: "/",
    name: "Dashboard",
    component: Dashboard,
    meta: adminMeta(`Overview • ${appConfig.name}`),
  },
  {
    path: "/players",
    name: "Players",
    component: Players,
    meta: adminMeta(`Players • ${appConfig.name}`),
  },
  {
    path: "/games",
    name: "Games",
    component: Games,
    meta: adminMeta(`Games • ${appConfig.name}`),
  },
  {
    path: "/status",
    name: "ApiStatus",
    component: ApiStatus,
    meta: adminMeta(`API Status • ${appConfig.name}`),
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { title: `Home • ${appConfig.name}` },
  },
  {
    path: "/features",
    name: "FeaturesLanding",
    component: FeaturesLanding,
    meta: { title: `Features • ${appConfig.name}` },
  },
  {
    path: "/pricing",
    name: "PricingLanding",
    component: PricingLanding,
    meta: { title: `Pricing • ${appConfig.name}` },
  },
  {
    path: "/contact",
    name: "ContactLanding",
    component: ContactLanding,
    meta: { title: `Contact • ${appConfig.name}` },
  },
  {
    path: "/signup",
    name: "Signup",
    redirect: { name: "Login" },
    meta: { title: `Login • ${appConfig.name}` },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
    meta: { title: `404 Not Found • ${appConfig.name}` },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_, __, savedPosition) {
    return savedPosition || { top: 0 };
  },
});

router.beforeEach(async (to, from, next) => {
  document.title = to.meta.title || appConfig.name;

  if (to.meta.requiresAuth) {
    const hasSession = await authService.isLoggedInWithTokenCheck();

    if (!hasSession) {
      next({
        name: "Login",
        query: { redirect: to.fullPath },
      });
      return;
    }

    if (to.meta.requiresAdmin && !authService.isAdmin()) {
      await authService.logout().catch(() => {});
      next({
        name: "Login",
        query: { reason: "admin", redirect: to.fullPath },
      });
      return;
    }
  }

  if (to.name === "Login" && authService.isAuthenticated()) {
    if (!authService.isAdmin()) {
      await authService.logout().catch(() => {});
      next();
      return;
    }

    const redirectTo = to.query.redirect || "/";
    next(redirectTo);
    return;
  }

  next();
});

export default router;
