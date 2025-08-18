<script setup lang="ts">
import {useChatStore} from "@/stores/chat.ts";
import {watch} from "vue";
import {useRoute} from "vue-router";

const route = useRoute();
const chatStore = useChatStore();

function openAlbum(album) {
  chatStore.actions.attachment.mediaBrowserCurrentAlbum = album;
  updateSelectedMedias();
}

function toggleMedia(media) {
  media.selected = !media.selected;
  updateSelectedMedias();
}

function updateSelectedMedias() {
  if (chatStore.actions.attachment.mediaBrowserSelectedItems) {
    chatStore.actions.attachment.mediaBrowserSelectedItems = chatStore.actions.attachment.mediaBrowserCurrentAlbum.medias.filter(media => media.selected)
  }
}

function backButton() {
  if (chatStore.actions.attachment.mediaBrowserCurrentAlbum) {
    chatStore.actions.attachment.mediaBrowserCurrentAlbum = null;
  } else {
    chatStore.actions.attachment.mediaBrowserSelectedItems.length = 0;
    // for (const album of mediaBrowserAlbums.value) {
    //   for (const image of album.images) {
    //     image.selected = false;
    // }
    // }
    chatStore.actions.attachment.mediaBrowserSnackbarVisible = false;
    chatStore.actions.attachment.mediaBrowserOpen = false;
  }
}

function attachButton() {
  chatStore.actions.attachment.mediaBrowserOpen = false;
  chatStore.actions.attachment.mediaBrowserCurrentAlbum = null;
}

watch(() => chatStore.actions.attachment.mediaBrowserOpen, (newValue) => {
  if (newValue) {
    chatStore.requestAlbums(route.params.userId, route.params.accountId);
  }
});

watch(() => chatStore.actions.attachment.mediaBrowserCurrentAlbum, (newValue) => {
  if (newValue) {
    chatStore.requestAlbumMedias(route.params.userId, route.params.accountId, newValue.id);
  }
})

watch(() => chatStore.actions.attachment.mediaBrowserSelectedItems, (val) => {
  chatStore.actions.attachment.mediaBrowserSnackbarVisible = val.length > 0;
})
</script>

<template>
  <v-dialog
      transition="dialog-bottom-transition"
      fullscreen
      v-model="chatStore.actions.attachment.mediaBrowserOpen"
  >
    <v-card>
      <v-toolbar color="white" height="45">
        <v-btn @click="backButton" style="z-index: 1">
          <img src="../../assets/arrow-back.svg" alt="back" width="26"/>
        </v-btn>
        <h2
            style="position: absolute; left: 0; right: 0"
        >
          Cloud Storage
        </h2>
      </v-toolbar>
      <v-list
          multiple
      >
        <div v-if="!chatStore.actions.attachment.mediaBrowserCurrentAlbum">
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-list-subheader style="padding: 0 !important;">Albums</v-list-subheader>
              </v-col>
              <v-col
                  v-for="album in chatStore.actions.attachment.mediaBrowserItems"
                  :key="album.id"
                  cols="6"
                  md="4"
                  lg="3"
              >
                <v-card @click="openAlbum(album)" class="hoverable" :image="album.cover" height="140"
                        color="surface-variant">
                  <p class="ma-2 position-absolute bottom-0">{{ album.title }}</p>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </div>
        <div v-else>
          <!--            <v-chip>{{ selectedImages.length }} selected</v-chip>-->
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-list-subheader style="padding: 0 !important;">Images - {{
                    chatStore.actions.attachment.mediaBrowserCurrentAlbum.title
                  }}
                </v-list-subheader>
              </v-col>
              <v-col
                  v-for="media in chatStore.actions.attachment.mediaBrowserCurrentAlbum.medias"
                  :key="media.id"
                  cols="4"
                  md="4"
                  lg="3"
              >
                <v-card
                    @click="toggleMedia(media)"
                    class="mx-auto"
                    color="surface-variant"
                    :image="media.src"
                    height="160"
                >
                  <v-btn
                      icon
                      size="21"
                      :color="media.selected ? 'black' : 'white'"
                      :style="{border: media.selected ? 'solid 6px white' : 'none'}"
                      class="ma-2"
                      @click.stop="toggleMedia(media)"
                  />
                  <p v-if="media.type === 'video'" style="position: absolute; right: 0; top: 0" class="ma-2">
                    {{ media.timestamp }}</p>
                  <!--                  <p style="position: absolute; right: 0; bottom: 0" class="ma-2">9 июня</p>-->
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </div>
      </v-list>
      <v-snackbar v-model="chatStore.actions.attachment.mediaBrowserSnackbarVisible" timeout="-1" color="black">
        Selected {{ chatStore.actions.attachment.mediaBrowserSelectedItems.length }} items.
        <template v-slot:actions>
          <v-btn
              color="white"
              variant="text"
              @click="attachButton"
          >
            Attach
          </v-btn>
        </template>
      </v-snackbar>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">

</style>