class AccountWatcher {

  page;
  cdpSession;

  userId = null;

  constructor(page, cdpSession) {
    this.page = page;
    this.cdpSession = cdpSession;
  }

  static async init(page, cdpSession) {
    const instance = new this(page, cdpSession);

    instance.cdpSession.on('Network.webSocketFrameReceived', async ({requestId, timestamp, response}) => {
      if (!response.payloadData.includes('room')) {
        return;
      }

      const data = await JSON.parse(response.payloadData.replace(/^42\/fc,/, ''));
      if (data[0] !== 'room_list') {
        return;
      }

      instance.userId = data[1].currentUserId;
    });

    return instance;
  }

  getUserId() {
    return this.userId;
  }

}

export default AccountWatcher;