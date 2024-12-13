class TelegramBotSceneBase {

  static id;

  service;

  constructor(service) {
    this.service = service;
  }

  async scene(){}
}

export default TelegramBotSceneBase;
