import {ref} from "vue";
import {defineStore} from 'pinia'

export const useDialogsStore = defineStore('dialogs', () => {
  const drawer = ref(false);

  return {
    drawer
  };
});
