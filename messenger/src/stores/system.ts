import {ref} from "vue";
import {defineStore} from 'pinia'

export const useSystemStore = defineStore('system', () => {
  const theme = ref('light');

  return {
    theme
  };
});