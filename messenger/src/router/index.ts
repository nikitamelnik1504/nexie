import { createRouter, createWebHistory } from 'vue-router'
import DialogsView from "@/views/DialogsView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:userId',
      name: 'home',
      redirect: to => {
        return `/${to.params.userId}/dialogs`;
      }
    },
    {
      path: '/:userId/dialogs',
      name: 'dialogs',
      component: DialogsView,
      props: route => ({ userId: route.params.userId }),
    },
  ],
})

export default router
