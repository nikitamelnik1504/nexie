import EventEmitter from "node:events";

class MessagesEmitter extends EventEmitter {

  wsRequestId = null;
  dialogId = null;

  cdpSession;

  constructor(cdpSession) {
    super();

    // Match WebSocket session.
    cdpSession.on('Network.webSocketCreated', ({requestId, url}) => {
      if (url.match(/^wss:\/\/im\.fancentro\.com/)) {
        this.wsRequestId = requestId;
      }
    });

    // Watch WebSocket incoming messages.
    cdpSession.on('Network.webSocketFrameReceived', ({requestId, response}) => {
      if (this.dialogId === null) {
        return;
      }

      if (this.wsRequestId === null || this.wsRequestId !== requestId) {
        return;
      }

      // Messages receive.
      if (response.payloadData.match(/42\/fc,\["room_buckets",/)) {
        const data = JSON.parse(response.payloadData.replace(/^42\/fc,/, ''));
        if (data[1].buckets.length > 0) {
          this.emit('messages', data[1].buckets[0].messages)
        }
      }
    });

    this.cdpSession = cdpSession;
  }

  async getMessages() {
    if (this.dialogId === null) {
      throw new Error('Dialog id is not set.');
    }

    if (this.wsRequestId === null) {
      throw new Error('WebSocket connection is not found.');
    }

    const payloadData = [
      'room_buckets',
      {
        roomId: this.dialogId,
        position: 'firstUnread',
        withNextBuckets: false,
        minCount: 50,
      }
    ];

    const message = `42/fc,${JSON.stringify(payloadData)}`;

    await this.cdpSession.send('Network.webSocketFrameSent', {
      requestId: this.wsRequestId,
      data: message,
    });
  }

  setDialogId(dialogId) {
    this.dialogId = dialogId;
  }
}

export default MessagesEmitter;