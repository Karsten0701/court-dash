import { createRouter, createWebHistory } from "vue-router";
import authService from "@/services/authService.js";
import appConfig from "@/config/appConfig.js";

const Home = () => import("@/pages/Home.vue");
const Login = () => import("@/pages/Login.vue");
const Signup = () => import("@/pages/Signup.vue");
const Leaderboard = () => import("@/pages/Leaderboard.vue");
const History = () => import("@/pages/History.vue");
const HistoryDetails = () => import("@/pages/HistoryDetails.vue");
const GameDetails = () => import("@/pages/GameDetails.vue");
const Account = () => import("@/pages/Account.vue");
const ProfileDetails = () => import("@/pages/ProfileDetails.vue");
const NotFound = () => import("@/pages/NotFound.vue");

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: { title: `Home • ${appConfig.name}` },
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
    component: Signup,
    meta: { title: `Sign Up • ${appConfig.name}` },
  },
  {
    path: "/leaderboard",
    name: "Leaderboard",
    component: Leaderboard,
    meta: { title: `Leaderboard • ${appConfig.name}` },
  },
  {
    path: "/history",
    name: "History",
    component: History,
    meta: {
      title: `History • ${appConfig.name}`,
      requiresAuth: true,
    },
  },
  {
    path: "/history/:id",
    name: "HistoryDetails",
    component: HistoryDetails,
    meta: {
      title: `History Details • ${appConfig.name}`,
      requiresAuth: true,
    },
  },
  {
    path: "/details/:id",
    name: "GameDetails",
    component: GameDetails,
    meta: { title: `Game Details • ${appConfig.name}` },
  },
  {
    path: "/account",
    name: "Account",
    component: Account,
    meta: {
      title: `Account • ${appConfig.name}`,
      requiresAuth: true,
    },
  },
  {
    path: "/profile/:id",
    name: "ProfileDetails",
    component: ProfileDetails,
    meta: {
      title: `Profile • ${appConfig.name}`,
      requiresAuth: true,
    },
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
