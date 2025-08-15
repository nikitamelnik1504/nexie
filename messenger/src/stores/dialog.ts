import {defineStore} from 'pinia'

import {useCoreStore} from "@/stores/core";
import {reactive} from "vue";

type Album = {
  id: string,
  title: string,
  cover: string,
  timestamp: string,
  medias: Array<any>,
  accountId: string
}

type Image = {
  id: string,
  src: string,
  timestamp: string,
  selected?: boolean,
  type: 'image'
}

type Video = {
  id: string,
  src: string,
  selected?: boolean,
  type: 'video'
}

export const useDialogStore = defineStore('dialog', () => {
  const coreStore = useCoreStore();

  async function requestAlbums(userId: string, accountId: string) {
    const matchedUser = coreStore.users.find(user => user.id === userId);
    return matchedUser.wsConnection.send(JSON.stringify({
      type: 'albumsList',
      accountId,
    }));
  }

  async function requestAlbumMedias(userId: string, accountId: string, albumId: string) {
    const matchedUser = coreStore.users.find(user => user.id === userId);
    return matchedUser.wsConnection.send(JSON.stringify({
      type: 'albumMediasList',
      accountId,
      albumId,
    }));
  }

  const chat = reactive({
    actions: {
      attachment: {
        selectTypeOpen: false,
        mediaBrowserOpen: false,
        mediaBrowserCurrentAlbum: null as Album | null,
        mediaBrowserItems: [] as Array<Image | Video>,
        mediaBrowserSelectedItems: [] as Array<Image | Video>,
        mediaBrowserSnackbarVisible: false,
        chargeableMessageModalOpen: false,
      },
      charge: {
        modalOpen: false,
        value: 0,
        currency: null,
      }
    }
  });

  return {
    chat,
    requestAlbums,
    requestAlbumMedias
  };
});
