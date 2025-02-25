import {ref} from 'vue'
import {defineStore} from 'pinia'

export const useApiStore = defineStore('api', () => {
  const websocketConnections = ref({});

  /**
   * Establishes or retrieves a WebSocket connection for a specific userId.
   * @param {string} userId - The user ID for whom the WebSocket connection is established.
   * @returns {Promise<WebSocket>} - Resolves with the WebSocket instance.
   */
  async function getWebSocketConnection(userId) {
    if (websocketConnections.value[userId]) {
      return websocketConnections.value[userId];
    }

    return websocketConnections.value[userId] = await new Promise((resolve) => {
      try {
        const wsUrl = import.meta.env.WS_API_URL + `?userId=${userId}`;
          const ws = new WebSocket(wsUrl);

        ws.onclose = (event) => {
          console.log(`WebSocket connection closed for user ${userId}`, event.reason);
          delete websocketConnections.value[userId];
        };

        ws.onerror = (error) => {
          console.error(`WebSocket error for user ${userId}:`, error);
        };

        ws.onopen = () => {
          resolve(ws);
        };
      } catch (error) {
        console.error(`Error establishing WebSocket connection for user ${userId}:`, error);
        throw error;
      }
    });
  }
  return {getWebSocketConnection}
})
