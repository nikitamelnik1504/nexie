class SceneBase {

  static id;

  service;

  constructor(service) {
    this.service = service;
  }

  async scene(){}
}

export default SceneBase;
