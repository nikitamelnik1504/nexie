class AccountWatcher {

  page;
  cdpSession;

  account = {
    authKey: null,
    sessionHash: null,
    username: null,
    id: null,
    externalId: null,
  };

  constructor(page, cdpSession) {
    this.page = page;
    this.cdpSession = cdpSession;
  }

  static async init(page, cdpSession) {
    const instance = new this(page, cdpSession);

    instance.cdpSession.on('Network.webSocketFrameSent', async ({requestId, timestamp, response}) => {
      if (response.payloadData.includes('authentication')) {
        const data = await JSON.parse(response.payloadData.replace(/^42\/fc,/, ''));

        if (data[0] !== 'authentication') {
          return;
        }

        instance.account.authKey = data[1].authKey;
        instance.account.sessionHash = data[1].sessionHash;
      }
    })

    instance.cdpSession.on('Network.webSocketFrameReceived', async ({requestId, timestamp, response}) => {
      if (response.payloadData.includes('room')) {
        const data = await JSON.parse(response.payloadData.replace(/^42\/fc,/, ''));
        if (data[0] !== 'room_list') {
          return;
        }

        instance.account.id = data[1].currentUserId;
      }

      if (response.payloadData.includes('authenticated')) {
        const data = await JSON.parse(response.payloadData.replace(/^42\/fc,/, ''));
        if (data[0] !== 'authenticated') {
          return;
        }

        instance.account.externalId = data[1].external.id;
      }
    });

    return instance;
  }

  getAccount() {
    return this.account;
  }

}

export default AccountWatcher;