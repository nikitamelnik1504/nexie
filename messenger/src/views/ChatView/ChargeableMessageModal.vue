<script setup lang="ts">
import {useChatStore} from "@/stores/chat.ts";

const chatStore = useChatStore();
</script>

<template>
  <v-dialog v-model="chatStore.actions.charge.modalOpen" class="paid-message-dialog">
    <v-card
        title="Chargeable message"
        style="box-shadow: none"
    >
      <template v-slot:default>
        <v-container fluid>
          <v-row class="px-2">
            <v-col cols="12" class="py-0">
              <label class="ms-1">
                Price (EUR)
                <input v-model="chatStore.actions.charge.value" type="number" step="0.01" class="mt-1"
                       style="border-radius: 5px">
              </label>
            </v-col>
          </v-row>
        </v-container>
      </template>
      <template v-slot:actions>
        <v-spacer></v-spacer>
        <v-btn @click="chatStore.actions.charge.modalOpen = false; chatStore.actions.charge.value = 0">
          Cancel
        </v-btn>

        <v-btn @click="chatStore.actions.charge.modalOpen = false">
          Submit
        </v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
.v-theme--dreamsync.paid-message-dialog {
  .v-card {
    background: #0D0F1A;
    color: #E0E0E0;

    input {
      background-color: unset;
      color: #E0E0E0;
      border: 1px solid #1E1E2E;
    }
  }
}
</style>