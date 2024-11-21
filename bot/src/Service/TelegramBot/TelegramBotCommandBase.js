class TelegramBotCommandBase {

  service;
  context;

  constructor(service, context) {
    this.service = service;
    this.context = context;
  }

  async run() {
  }
}

export default TelegramBotCommandBase;