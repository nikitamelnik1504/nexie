import { createRouter, createWebHistory } from 'vue-router'
import DialogsView from "@/views/DialogsView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/dialogs',
      name: 'dialogs',
      component: DialogsView,
    },
  ],
})

export default router
