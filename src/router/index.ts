import { createRouter, createWebHistory } from 'vue-router'
import autoLoadRoutes from "./autoload";
import customRoutes from "./route";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...customRoutes, ...autoLoadRoutes]
})

export default router
