<script setup lang="ts">
import {useRoute} from "vue-router";
import {ref, computed, watch} from "vue";
import {useCoreStore} from "@/stores/core.ts";

type Album = {
  id: string,
  name: string,
  timestamp?: any,
  preview_image_src: string,
  images: Image[],
  videos: Video[] | null,
}

type Image = {
  id: string,
  name: string,
  timestamp: string,
  src: string
}

type Video = {
  id: string,
  name: string,
  timestamp: string,
  src: string
}

const route = useRoute();
const coreStore = useCoreStore();

const messageText = ref('');
const accounts = coreStore.getAccounts(route.params.userId);
const account = computed(() => {
  return accounts.value.find(account => account.id === route.params.accountId);
});
const dialogs = computed(() => {
  let res = [];
  for (const account of accounts.value) {
    const dialogsFromAccount = coreStore.getDialogs(account.id).value;
    const dialogsWithNewProperty = dialogsFromAccount.map(dialog => ({
      ...dialog,
      platform: account.platform,
      username: account.username
    }));
    res = res.concat(dialogsWithNewProperty);
  }
  return res;
});
const dialog = computed(() => {
  return dialogs.value.find(dialog => dialog.accountId === route.params.accountId && dialog.id === route.params.dialogId);
});
const messages = coreStore.getMessages(route.params.userId, route.params.accountId, route.params.dialogId);
const reversedMessages = computed(() => [...messages.value].sort((x, y) => x.timestamp - y.timestamp).reverse());

const mediaBrowserOpen = ref(false);
const mediaAttachmentMenuOpen = ref(false);
const mediaBrowserSelectedAlbum = ref();
const mediaBrowserItemsSelected = ref([])
const mediaBrowserSnackbar = ref(false);
const mediaBrowserAlbums = coreStore.getAlbums(route.params.accountId);

const paidMessageModal = ref(false);
const messagePrice = ref(0);

function openAlbum(album) {
  mediaBrowserSelectedAlbum.value = album
  updateSelectedMedias()
}

function toggleMedia(media) {
  media.selected = !media.selected
  updateSelectedMedias()
}

function updateSelectedMedias() {
  if (mediaBrowserSelectedAlbum.value) {
    mediaBrowserItemsSelected.value = mediaBrowserSelectedAlbum.value.medias.filter(media => media.selected)
  }
}

function mediaBrowserBackButton() {
  if (mediaBrowserSelectedAlbum.value) {
    mediaBrowserSelectedAlbum.value = false;
  } else {
    mediaBrowserItemsSelected.value.length = 0;
    // for (const album of mediaBrowserAlbums.value) {
    //   for (const image of album.images) {
    //     image.selected = false;
    // }
    // }
    mediaBrowserSnackbar.value = false;
    mediaBrowserOpen.value = false;
  }
}

function mediaBrowserAttachButton() {
  mediaBrowserOpen.value = false;
  mediaBrowserSelectedAlbum.value = false;
}

watch(mediaBrowserOpen, (newValue) => {
  if (newValue) {
    coreStore.requestAlbums(route.params.userId, route.params.accountId);
  }
});

watch(mediaBrowserSelectedAlbum, (newValue) => {
  if (newValue) {
    coreStore.requestAlbumMedias(route.params.userId, route.params.accountId, newValue.id);
  }
})

watch(mediaBrowserItemsSelected, (val) => {
  mediaBrowserSnackbar.value = val.length > 0;
})

watch(accounts, (newValue) => {
  if (newValue.length !== 0 && !dialog.value) {
    coreStore.requestDialogs(route.params.userId, account.value.id);
  }
}, {immediate: true});

watch(dialog, (newValue) => {
  if (newValue.length !== 0) {
    coreStore.requestMessages(route.params.userId, route.params.accountId, route.params.dialogId);
  }
})

if (dialogs.value.length !== 0) {
  coreStore.requestMessages(route.params.userId, route.params.accountId, route.params.dialogId);
}

function formatTime(timestamp: number) {
  const isMilliseconds = timestamp > 9999999999;

  const normalizedTimestamp = isMilliseconds ? timestamp : timestamp * 1000;

  return new Date(normalizedTimestamp).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function sendMessage() {
  const message = {
    id: null,
    dialogId: route.params.dialogId,
    text: messageText.value,
    author: account.value.me.id,
    timestamp: Date.now(),
    status: 'sending',
    attachments: [...mediaBrowserItemsSelected.value]
  };

  if (messagePrice.value !== 0) {
    message.charge = {
      price: messagePrice.value,
      currency: 'eur',
      paid: false,
    };
  }

  coreStore.messages.push(message);
  coreStore.requestSendMessage(route.params.userId, route.params.accountId, route.params.dialogId, messageText.value, mediaBrowserItemsSelected.value, message.charge ? message.charge : {});
  messagePrice.value = 0;
  messageText.value = '';
  mediaBrowserItemsSelected.value.length = 0;
}

</script>

<template>
  <div class="dialog">
    <header>
      <div class="dialog__back">
        <router-link :to="{name: 'dialogs', params: { userId: route.params.userId }}">
          <img src="../assets/arrow-back.svg" alt="back">
        </router-link>
      </div>
      <div class="dialog__user">
        <div class="dialog__user__image">
          {{ dialog ? Array.from(dialog.member.username)[0].toUpperCase() : '' }}
        </div>
        <div>
          <div class="dialog__user__name">
            <h2>{{ dialog ? dialog.member.username : 'Loading...' }}</h2>
          </div>
          <div class="dialog__user__platform" :class="{
            'ton': dialog.platform === 'ton',
            'fancentro': dialog.platform === 'fancentro',
          }">
            <div>
              <img src="../assets/ton.svg" alt="" v-if="dialog.platform === 'ton'">
              <img src="../assets/fancentro.png" alt="" v-else-if="dialog.platform === 'fancentro'"
                   class="fancentro-logo">
            </div>
            <h4>{{ dialog ? dialog.platform : 'Loading...' }} -
              {{ dialog ? dialog.username : 'Loading...' }}</h4>
          </div>
        </div>
      </div>
      <div class="dialog__actions">
        <!-- Optional actions like a button for leaving the chat -->
      </div>
    </header>
    <div class="dialog__messages">
      <div v-if="messages.length !== 0" v-for="dialogMessage in reversedMessages" :key="dialogMessage.id"
           class="message"
           :class="{
        'me': dialogMessage.author === account.me.id,
        'not-me': dialogMessage.author !== account.me.id,
      }"
      >
        <v-container v-if="dialogMessage.attachments.length !== 0">
          <v-row class="justify-end">
            <v-col :cols="(() => {
              if (dialogMessage.attachments.length === 1) {
                return 12;
              }
              if (dialogMessage.attachments.length === 2) {
                return 6;
              }
               if (dialogMessage.attachments.length >= 3) {
                return 4;
              }
            })()" v-for="attachment in dialogMessage.attachments" :key="attachment.id">
              <v-img
                  class="mx-auto"
                  max-width="300"
                  min-width="60"
                  :src="attachment.src"
              >
                <template v-slot:placeholder>
                  <div class="d-flex align-center justify-center fill-height">
                    <v-progress-circular
                        color="grey-lighten-4"
                        indeterminate
                    ></v-progress-circular>
                  </div>
                </template>
              </v-img>
            </v-col>
          </v-row>
        </v-container>
        <p>{{ dialogMessage.text }}</p>
        <span>{{ formatTime(dialogMessage.timestamp) }}</span>
      </div>
      <div v-else class="dialog__messages__loader">
        <v-progress-circular color="black" model-value="60" indeterminate/>
      </div>
    </div>
    <div class="dialog__field">
      <div class="position-relative wrapper" style="flex: 1">
        <input v-model="messageText" placeholder="Please write the message" class="position-relative"
               style="padding-right: 39px;"/>
        <button class="position-absolute d-flex justify-end w-auto"
                :class="{'v-btn--disabled': mediaBrowserItemsSelected.length === 0}" style="top: 3px; right: 2px"><img
            src="../assets/dollar.svg" alt="" width="40" @click="paidMessageModal = true">
          <span v-if="messagePrice !== 0" class="position-absolute"
                style="width: 4px;height: 4px;border-radius: 10px;right: 17.6px;top: 34px;background: black;"/>
        </button>
      </div>
      <button class="attachment d-flex justify-center position-relative" @click="mediaAttachmentMenuOpen = true">
        <img alt="attachment" src="../assets/attachment.svg" width="21"/>
        <span v-if="mediaBrowserItemsSelected.length > 0" class="px-1"
              style="position:absolute;right: -5px;top: -5px;background: white;color: black;border-radius: 20px;border: solid 4px black;font-size: 12px;line-height: 16px">{{
            mediaBrowserItemsSelected.length
          }}</span>
      </button>
      <button @click="sendMessage" :disabled="!messageText && mediaBrowserItemsSelected.length === 0"
              :class="{'v-btn--disabled': !messageText && mediaBrowserItemsSelected.length === 0}">Send
      </button>
    </div>
  </div>
  <v-bottom-sheet v-model="mediaAttachmentMenuOpen">
    <v-list>
      <v-list-subheader title="Select attachment type"></v-list-subheader>

      <v-list-item
          v-for="tile in [{ title: 'Cloud'}, {title: 'Upload'}]"
          :key="tile.title"
          :title="tile.title"
          :disabled="tile.title === 'Upload'"
          @click="mediaAttachmentMenuOpen = false; mediaBrowserOpen = true"
      >
        <!--            :prepend-avatar="`https://dn.vuetifyjs.com/images/bottom-sheets/${tile.img}`"-->
      </v-list-item>
    </v-list>
  </v-bottom-sheet>
  <v-dialog
      transition="dialog-bottom-transition"
      fullscreen
      v-model="mediaBrowserOpen"
  >
    <v-card>
      <v-toolbar color="white" height="45">
        <v-btn @click="mediaBrowserBackButton" style="z-index: 1">
          <img src="../assets/arrow-back.svg" alt="back" width="26"/>
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
        <div v-if="!mediaBrowserSelectedAlbum">
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-list-subheader style="padding: 0 !important;">Albums</v-list-subheader>
              </v-col>
              <v-col
                  v-for="album in mediaBrowserAlbums"
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
                    mediaBrowserSelectedAlbum.title
                  }}
                </v-list-subheader>
              </v-col>
              <v-col
                  v-for="media in mediaBrowserSelectedAlbum.medias"
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
                    height="120"
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
      <v-snackbar v-model="mediaBrowserSnackbar" timeout="-1" color="black">
        Selected {{ mediaBrowserItemsSelected.length }} items.
        <template v-slot:actions>
          <v-btn
              color="white"
              variant="text"
              @click="mediaBrowserAttachButton"
          >
            Attach
          </v-btn>
        </template>
      </v-snackbar>
    </v-card>
  </v-dialog>
  <v-dialog v-model="paidMessageModal" class="paid-message-dialog">
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
                <input v-model="messagePrice" type="number" step="0.01" class="mt-1" style="border-radius: 5px">
              </label>
            </v-col>
          </v-row>
        </v-container>
      </template>
      <template v-slot:actions>
        <v-spacer></v-spacer>
        <v-btn @click="paidMessageModal = false; messagePrice = 0">
          Cancel
        </v-btn>

        <v-btn @click="paidMessageModal = false">
          Submit
        </v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>


<style lang="scss">
.dialog {
  height: 100vh;
  display: flex;
  flex-direction: column;

  header {
    border-bottom: solid 1px rgba(0, 0, 0, 0.09);
    padding: 10px 12px;
    display: flex;

    .dialog__back {
      display: flex;
      margin-right: 5px;

      a {
        display: flex;
        align-items: center;

        img {
          width: 26px;
        }
      }
    }

    .dialog__user {
      text-align: start;
      display: flex;
      align-items: center;
      margin-right: 20px;

      .dialog__user__name h2 {
        font-weight: bold;
        font-size: 15px;
      }

      .dialog__user__platform {
        display: flex;
        align-items: center;
        padding-bottom: 2px;

        div {
          width: 18px;
          margin-right: 3px;
          display: flex;
          align-items: center;
          justify-content: center;

          img {
            max-width: 100%;
            max-height: 100%;
          }
        }

        h4 {
          font-size: 13px;
          line-height: 14px;
          opacity: 0.7;
          font-weight: bold;
        }

        &.ton {
          h4 {
            color: #3380cc;
          }
        }

        &.fancentro {
          div {
            img {
              max-width: 80%;
              max-height: 80%;
            }
          }

          h4 {
            color: #8954c8;
          }
        }
      }

      .dialog__user__image {
        display: flex;
        align-items: center;
        justify-content: center;
        background: #EFEFEF;
        width: 45px;
        height: 45px;
        border-radius: 40px;
        margin-right: 10px;
      }
    }
  }

  .dialog__messages {
    flex: 1;
    display: flex;
    flex-direction: column-reverse;
    padding: 10px 12px;
    overflow: scroll;

    .message {
      font-size: 14px;
      display: inline-flex;
      flex-direction: column;
      padding: 8px 14px;
      border-radius: 12px;
      margin-bottom: 10px;
      max-width: 78%;

      &.me {
        background: black;
        color: white;
        align-self: end;
        align-items: end;
      }

      &.not-me {
        align-self: start;
        color: black;
        background: #EFEFEF;
      }

      span {
        font-size: 12px;
      }
    }

    .dialog__messages__loader {
      font-size: 21px;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .dialog__field {
    padding: 10px 12px;
    border-top: solid 1px rgba(0, 0, 0, 0.09);
    display: flex;

    .wrapper {
      input {
        font-size: 14px;
        padding: 12px 14px;
        background-color: #EFEFEF;
        border: none;
        border-radius: 20px;
        width: 100%;
        flex: 1;
      }

      button {
        background: none;
      }
    }

    button {
      font-size: 14px;
      width: 64px;
      border: none;
      border-radius: 20px;
      background: black;
      color: white;
      margin-left: 8px;

      &.attachment {
        border-radius: 12px;
        width: 48px;
      }
    }
  }
}
.paid-message-dialog {
  input {
    font-size: 14px;
    padding: 12px 14px;
    background-color: #EFEFEF;
    border: none;
    width: 100%;
    flex: 1;
  }
}
</style>