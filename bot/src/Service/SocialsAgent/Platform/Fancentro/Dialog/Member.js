class Member {

  id;
  externalId;
  username;

  constructor(data) {
    this.id = data.userExternalId;
    this.externalId = data.userId;
    this.username = data.userData.originName;
  }
}

export default Member;