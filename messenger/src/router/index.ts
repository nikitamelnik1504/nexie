import {createRouter, createWebHistory} from 'vue-router'
import DialogsView from "@/views/DialogsList/index.vue";
import DialogView from "@/views/ChatView/index.vue";
import {useCoreStore} from "@/stores/core";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:userId',
      name: 'home',
      redirect: to => {
        return `/${to.params.userId}/dialogs`;
      },
    },
    {
      path: '/:userId/dialogs',
      name: 'dialogs',
      component: DialogsView,
      props: route => ({userId: route.params.userId}),
    },
    {
      path: '/:userId/dialogs/:accountId/:dialogId',
      name: 'dialog',
      component: DialogView,
      props: route => ({
        userId: route.params.userId,
        accountId: route.params.accountId,
        dialogId: route.params.dialogId
      }),
    }
  ],
})

router.beforeEach((to, from) => {
  const coreStore = useCoreStore();

  if (!coreStore.user(to.params.userId).value) {
    coreStore.addUser(to.params.userId);
  }

  if (coreStore.getAccounts(to.params.userId).value.length === 0) {
    coreStore.startWebSocketConnection(to.params.userId);
  }
})

export default router
