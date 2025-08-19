import {ref} from "vue";
import {defineStore} from 'pinia'

export const useSystemStore = defineStore('system', () => {
  const theme = ref('nexie-minimal');

  return {
    theme
  };
});