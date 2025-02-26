class Member {

  me;
  id;
  externalId;
  username;

  constructor(me, data) {
    this.me = me;
    this.id = data.userExternalId;
    this.externalId = data.userId;
    this.username = data.userData.originName;
  }
}

export default Member;