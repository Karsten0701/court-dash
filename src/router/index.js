import { createRouter, createWebHistory } from "vue-router";
import authService from "@/services/authService.js";
import appConfig from "@/config/appConfig.js";

const Landing = () => import("@/pages/Landing.vue");
const Pricing = () => import("@/pages/Pricing.vue");
const Dashboard = () => import("@/pages/Dashboard.vue");
const Players = () => import("@/pages/Players.vue");
const Games = () => import("@/pages/Games.vue");
const Login = () => import("@/pages/Login.vue");
const NotFound = () => import("@/pages/NotFound.vue");

const dashboardMeta = (title) => ({
  title,
  requiresAuth: true,
  requiresDashboardAccess: true,
});

const managerMeta = (title) => ({
  ...dashboardMeta(title),
  requiresManager: true,
});

const routes = [
  {
    path: "/",
    name: "Landing",
    component: Landing,
    meta: { title: appConfig.name, isLanding: true },
  },
  {
    path: "/pricing",
    name: "Pricing",
    component: Pricing,
    meta: { title: `Pricing • ${appConfig.name}`, isLanding: true },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: dashboardMeta(`Overview • ${appConfig.name}`),
  },
  {
    path: "/players",
    name: "Players",
    component: Players,
    meta: managerMeta(`Players • ${appConfig.name}`),
  },
  {
    path: "/games",
    name: "Games",
    component: Games,
    meta: managerMeta(`Games • ${appConfig.name}`),
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { title: `Login • ${appConfig.name}` },
  },
  {
    path: "/signup",
    name: "Signup",
    redirect: { name: "Pricing" },
    meta: { title: `Pricing • ${appConfig.name}` },
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
  scrollBehavior(to, _, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) {
      return { el: to.hash, behavior: "smooth", top: 80 };
    }
    return { top: 0 };
  },
});

router.beforeEach(async (to, from, next) => {
  document.title = to.meta.title || appConfig.name;

  if (to.name === "Landing" || to.name === "Pricing") {
    if (!authService.isAuthenticated() || !authService.canAccessDashboard()) {
      next();
      return;
    }

    const valid = await authService.isLoggedInWithTokenCheck();
    if (valid) {
      next({ name: "Dashboard" });
      return;
    }

    next();
    return;
  }

  if (to.meta.requiresAuth) {
    const hasSession = await authService.isLoggedInWithTokenCheck();

    if (!hasSession) {
      next({
        name: "Login",
        query: { redirect: to.fullPath },
      });
      return;
    }

    if (to.meta.requiresDashboardAccess && !authService.canAccessDashboard()) {
      await authService.logout().catch(() => {});
      next({
        name: "Login",
        query: { reason: "dashboard", redirect: to.fullPath },
      });
      return;
    }

    if (to.meta.requiresManager && !authService.isManager()) {
      next({ name: "Dashboard" });
      return;
    }
  }

  if (to.name === "Login" && authService.isAuthenticated()) {
    if (!authService.canAccessDashboard()) {
      await authService.logout().catch(() => {});
      next();
      return;
    }

    const redirectTo = to.query.redirect || "/dashboard";
    next(redirectTo);
    return;
  }

  next();
});

export default router;
