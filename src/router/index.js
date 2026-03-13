import { createRouter, createWebHistory } from "vue-router";
import authService from "@/services/authService.js";
import appConfig from "@/config/appConfig.js";

const Dashboard = () => import("@/pages/Dashboard.vue");
const Players = () => import("@/pages/Players.vue");
const Games = () => import("@/pages/Games.vue");
const ApiStatus = () => import("@/pages/ApiStatus.vue");
const Login = () => import("@/pages/Login.vue");
const NotFound = () => import("@/pages/NotFound.vue");

const routes = [
  {
    path: "/",
    name: "Dashboard",
    component: Dashboard,
    meta: { title: `Overview • ${appConfig.name}`, requiresAuth: true },
  },
  {
    path: "/players",
    name: "Players",
    component: Players,
    meta: { title: `Players • ${appConfig.name}`, requiresAuth: true },
  },
  {
    path: "/games",
    name: "Games",
    component: Games,
    meta: { title: `Games • ${appConfig.name}`, requiresAuth: true },
  },
  {
    path: "/status",
    name: "ApiStatus",
    component: ApiStatus,
    meta: { title: `API Status • ${appConfig.name}`, requiresAuth: true },
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
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

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || appConfig.name;

  // Check if the route requires authentication
  if (to.meta.requiresAuth) {
    // Only check if user data exists in localStorage (not validating token)
    // Token validation happens via HTTP-only cookies on API calls
    if (!authService.isAuthenticated()) {
      // No user data, redirect to login
      next({
        name: "Login",
        query: { redirect: to.fullPath },
      });
      return;
    }
  }

  // If going to login page and already logged in, redirect to account or intended destination
  if (to.name === "Login" && authService.isAuthenticated()) {
    const redirectTo = to.query.redirect || "/account";
    next(redirectTo);
    return;
  }

  next();
});

export default router;
