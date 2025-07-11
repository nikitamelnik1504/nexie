import DialogsCollection from "./DialogsCollection.js";
import Me from "./Me.js";
import Dialog from "./Dialog.js";
import MessagesCollection from "./MessagesCollection.js";
import Message from "./Message.js";
import Member from "./Member.js";
import AlbumsCollection from "./AlbumsCollection.js";
import Album from "./Album.js";
import Image from "./Image.js";
import MediasCollection from "./MediasCollection.js";
import Video from "./Video.js";
import ImageAttachment from "./ImageAttachment.js";

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

  createMediasCollection(_album) {
    return MediasCollection.create(this.messenger, _album, this.browserDaemonEventEmitter);
  }

  createMedia(data, _collection = null) {
    switch (data.elementType) {
      case 'photo':
        return Image.create(this.messenger, _collection, this.browserDaemonEventEmitter, data);
      case 'video':
        return Video.create(this.messenger, _collection, this.browserDaemonEventEmitter, data);
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
    if (data.type === 'photo') {
      ImageAttachment.create(this.messenger, _message, this.browserDaemonEventEmitter, data);
    }
  }
}

export default MessengerFactory;