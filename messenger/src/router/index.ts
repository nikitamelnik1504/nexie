import { createRouter, createWebHistory } from 'vue-router'
import DialogsView from "@/views/DialogsView.vue";
import DialogView from "@/views/DialogView.vue";

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
    {
      path: '/:userId/dialogs/:dialogId',
      name: 'dialog',
      component: DialogView,
      props: route => ({ userId: route.params.userId, dialogId: route.params.dialogId }),
    }
  ],
})

export default router
