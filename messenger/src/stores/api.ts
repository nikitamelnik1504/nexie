import {ref} from 'vue'
import {defineStore} from 'pinia'

export const useApiStore = defineStore('api', () => {
  const websocketConnection = ref(null);

  async function fetchWebSocketConnection(apiUrl, userId) {
    const response = await fetch(apiUrl + '/' + userId + '/dialogs/webSocket', {
      headers: {
        "ngrok-skip-browser-warning": true
      }
    });

    try {
      websocketConnection.value = new WebSocket('ws://' + 'localhost:3002' + `?userId=${userId}`);
    } catch (error) {
    }
  }

  return {websocketConnection, fetchWebSocketConnection}
})
