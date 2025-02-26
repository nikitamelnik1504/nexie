class MembersCollection {

  me;
  collection = [];

  constructor(me) {
    this.me = me;
  }

  add(member) {
    this.collection.push(member);
    return member;
  }

}

export default MembersCollection;