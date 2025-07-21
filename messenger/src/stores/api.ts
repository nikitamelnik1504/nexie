import {ref} from 'vue'
import {defineStore} from 'pinia'

import {useCoreStore} from "@/stores/core.ts";

export const useApiStore = defineStore('api', () => {
  const websocketConnections = ref({});

  const coreStore = useCoreStore();

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
        // @todo Implement env properly.
        const wsUrl = (import.meta.env.VITE_WS_API_URL ? import.meta.env.VITE_WS_API_URL : 'wss://sem-bot.cryptowordll.space') + `?userId=${userId}`;
        const ws = new WebSocket(wsUrl);

        ws.onclose = (event) => {
          console.log(`WebSocket connection closed for user ${userId}`, event.reason);
          delete websocketConnections.value[userId];
          coreStore.addNotification('error', 'Lost connection to the SEM SocialAgents service', true);
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
