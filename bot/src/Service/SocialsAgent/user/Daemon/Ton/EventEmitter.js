import EE from "node:events";

class EventEmitter extends EE {

  _watchers;

  constructor(watchers) {
    super();
    this._watchers = watchers;

    this._watchers.dialogs.watcher.on("dialogsList", (data) => {
      for (const dialog of data.list) {
        this._watchers.dialogs.store.requestDialogs.cache.push(dialog);
      }

      this._watchers.dialogs.store.requestDialogs.queue -= 1;

      if (data.nextFrom === '') {
        this._watchers.dialogs.store.requestDialogs.queue = 0;
        this._watchers.dialogs.store.requestDialogs.nextFrom = data.nextFrom;
      } else {
        this._watchers.dialogs.store.requestDialogs.nextFrom = +data.nextFrom;
      }

      if (this._watchers.dialogs.store.requestDialogs.queue !== 0) {
        this._watchers.dialogs.watcher.requestDialogs(this._watchers.dialogs.store.requestDialogs.nextFrom);
      } else {
        if (this._watchers.dialogs.store.requestDialogs.cache.length === 0) {
          return;
        }

        this.emit('dialogsList', this._watchers.dialogs.store.requestDialogs.cache);
        this._watchers.dialogs.store.requestDialogs.cache.length = 0;
      }
    })

    this._watchers.messages.watcher.on("messagesList", (data) => {
      for (const message of data.list) {
        this._watchers.messages.store.requestMessages[data.memberId].cache.push(message);
      }

      this._watchers.messages.store.requestMessages[data.memberId].queue -= 1;

      if (data.nextFrom === '') {
        this._watchers.messages.store.requestMessages[data.memberId].queue = 0;
        this._watchers.messages.store.requestMessages[data.memberId].nextFrom = data.nextFrom;
      } else {
        this._watchers.messages.store.requestMessages[data.memberId].nextFrom = +data.nextFrom;
      }

      if (this._watchers.messages.store.requestMessages[data.memberId].queue !== 0) {
        this._watchers.messages.watcher.requestMessages(data.memberId, this._watchers.messages.store.requestMessages[data.memberId].nextFrom);
      } else {
        if (this._watchers.messages.store.requestMessages[data.memberId].cache.length === 0) {
          return;
        }

        this.emit('messagesList', { memberId: data.memberId, data: this._watchers.messages.store.requestMessages[data.memberId].cache });
        this._watchers.messages.store.requestMessages[data.memberId].cache.length = 0;
      }
    });

    this._watchers.messages.watcher.on("messageSent", (data, _bag) => {
      this.emit('messageSent', data, _bag);
    });

    this._watchers.messages.watcher.on("messageNew", (data) => {
      this.emit('messageNew', { memberId: data.fromId, ...data });
    });

    this._watchers.media.watcher.on("albumsList", (data) => {
      this.emit('albumsList', data.list);
    });

    this._watchers.media.watcher.on("albumMediasList", (data) => {
      this.emit('albumMediasList', { albumId: data.albumId, data: data.list });
    });
  }

  getMe() {
    return this._watchers.dialogs.watcher.account;
  }

  requestDialogs(count) {
    const DIALOGS_RETURNING_PER_REQUEST = 50;
    this._watchers.dialogs.store.requestDialogs.queue = Math.ceil(+count / DIALOGS_RETURNING_PER_REQUEST);
    this._watchers.dialogs.watcher.requestDialogs(this._watchers.dialogs.store.requestDialogs.nextFrom);
  }

  requestMessages(dialogId, count) {
    if (!(dialogId in this._watchers.messages.store.requestMessages)) {
      this._watchers.messages.store.requestMessages[dialogId] = {
        queue: 0,
        nextFrom: 0,
        cache: [],
      };
    }

    const MESSAGES_RETURNING_PER_REQUEST = 50;
    this._watchers.messages.store.requestMessages[dialogId].queue = Math.ceil(+count / MESSAGES_RETURNING_PER_REQUEST);

    if (this._watchers.messages.store.requestMessages[dialogId].nextFrom === '') {
      return;
    }

    this._watchers.messages.watcher.requestMessages(dialogId, this._watchers.messages.store.requestMessages[dialogId].nextFrom);
  }

  requestAlbums() {
    this._watchers.media.watcher.requestAlbums();
  }

  requestMedia(albumId, count) {
    this._watchers.media.watcher.requestMedia(albumId, 0);
  }

  sendMessage(dialogId, message, attachments = [], charge = {}, _bag = {}) {
    this._watchers.messages.watcher.sendMessage(dialogId, message, attachments, charge, _bag);
  }
}

export default EventEmitter;