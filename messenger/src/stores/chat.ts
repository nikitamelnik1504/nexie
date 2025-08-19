import {defineStore} from 'pinia'
import {reactive} from "vue";

import {useCoreStore} from "@/stores/core";

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

export const useChatStore = defineStore('chat', () => {
  const coreStore = useCoreStore();

  async function requestAlbums(userId: string, accountId: string) {
    const matchedUser = coreStore.users.find(user => user.id === userId);
    return matchedUser.wsConnection.emit('albumsList', {
      accountId,
    });
  }

  async function requestAlbumMedias(userId: string, accountId: string, albumId: string) {
    const matchedUser = coreStore.users.find(user => user.id === userId);
    return matchedUser.wsConnection.emit('albumMediasList', {
      accountId,
      albumId,
    });
  }

  const actions = reactive({
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
  });

  return {
    actions,
    requestAlbums,
    requestAlbumMedias
  };
});
