class Me {

  id;
  externalId;
  username;

  constructor(data) {
    this.id = data.id;
    this.externalId = data.externalId;
    this.username = data.username;
  }

}

export default Me;