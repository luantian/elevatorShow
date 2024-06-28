import { createRouter, createWebHistory, createWebHashHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import("@/views/Car.vue"), },
    { path: '/test', component: () => import("@/views/Test.vue"), },
  ],
})

export default router
