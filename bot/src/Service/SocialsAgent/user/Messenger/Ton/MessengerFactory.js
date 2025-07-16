import DialogsCollection from "./DialogsCollection.js";
import Me from "./Me.js";
import Dialog from "./Dialog.js";
import MessagesCollection from "./MessagesCollection.js";
import Message from "./Message.js";
import Member from "./Member.js";
import AlbumsCollection from "./AlbumsCollection.js";
import Album from "./Album.js";
import Image from "./Image.js";
import Video from "./Video.js";
import ImageAttachment from "./ImageAttachment.js";
import AlbumItem from "./AlbumItem.js";
import AlbumItemsCollection from "./AlbumItemsCollection.js";
import VideoAttachment from "./VideoAttachment.js";

class MessengerFactory {

  constructor(messenger, browserDaemonEventEmitter) {
    this.messenger = messenger;
    this.browserDaemonEventEmitter = browserDaemonEventEmitter;
  }

  createMe(data) {
    return Me.create(this.messenger, this.browserDaemonEventEmitter, data);
  }

  createMember(_dialog, data) {
    return Member.create(this.messenger, _dialog, this.browserDaemonEventEmitter, data);
  }

  createAlbumsCollection() {
    return AlbumsCollection.create(this.messenger, this.browserDaemonEventEmitter);
  }

  createAlbum(_collection, data) {
    return Album.create(this.messenger, _collection, this.browserDaemonEventEmitter, data);
  }

  createAlbumItemsCollection(_album = null) {
    return AlbumItemsCollection.create(this.messenger, _album, this.browserDaemonEventEmitter);
  }

  createAlbumItem(_collection, data) {
    return AlbumItem.create(this.messenger, _collection, this.browserDaemonEventEmitter, data);
  }

  createMedia(type, data) {
    switch (type) {
      case 'photo':
      case 'image':
        return Image.create(this.messenger, this.browserDaemonEventEmitter, data.photo ? data.photo : data);
      case 'video':
        return Video.create(this.messenger, this.browserDaemonEventEmitter, data.video ? data.video : data);
    }
  }

  createDialogsCollection() {
    return DialogsCollection.create(this.messenger, this.browserDaemonEventEmitter);
  }

  createDialog(_collection, data) {
    return Dialog.create(this.messenger, _collection, this.browserDaemonEventEmitter, data);
  }

  createMessagesCollection(_dialog) {
    return MessagesCollection.create(this.messenger, _dialog, this.browserDaemonEventEmitter);
  }

  createMessage(_collection, data) {
    return Message.create(this.messenger, _collection, this.browserDaemonEventEmitter, data);
  }

  createAttachment(_message, data) {
    if (data.type === 'photo' || data.type === 'image') {
      return ImageAttachment.create(this.messenger, _message, this.browserDaemonEventEmitter, data);
    }
    if (data.type === 'video') {
      return VideoAttachment.create(this.messenger, _message, this.browserDaemonEventEmitter, data);
    }
  }
}

export default MessengerFactory;