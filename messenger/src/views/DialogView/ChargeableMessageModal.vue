<script setup lang="ts">
import {useDialogStore} from "@/stores/dialog.ts";

const dialogStore = useDialogStore();
</script>

<template>
    <v-dialog v-model="dialogStore.chat.actions.charge.modalOpen" class="paid-message-dialog">
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
                  <input v-model="dialogStore.chat.actions.charge.price" type="number" step="0.01" class="mt-1" style="border-radius: 5px">
                </label>
              </v-col>
            </v-row>
          </v-container>
        </template>
        <template v-slot:actions>
          <v-spacer></v-spacer>
          <v-btn @click="dialogStore.chat.actions.charge.modalOpen = false; dialogStore.chat.actions.charge.price = 0">
            Cancel
          </v-btn>

          <v-btn @click="dialogStore.chat.actions.charge.modalOpen = false">
            Submit
          </v-btn>
        </template>
      </v-card>
    </v-dialog>
</template>

<style scoped lang="scss">

</style>