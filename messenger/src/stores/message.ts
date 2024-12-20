import {computed, ref} from 'vue'
import {defineStore} from "pinia";

export const useMessageStore = defineStore('message', () => {
  const dialogs = ref([]);

  function addDialog(platform, username, timestamp, preview_message, image, messages_count) {
    dialogs.value.push({
      platform,
      username,
      timestamp,
      preview_message,
      image,
      messages_count,
    });
  }

  const dialogsSorted = computed(() => dialogs.value.sort((x, y) => x.timestamp - y.timestamp));

  return {dialogs, addDialog, dialogsSorted};
})