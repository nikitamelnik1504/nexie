class WebSocketGet {

  static async run(request, response, wsServer, telegramBotService, socialsAgentService) {
    return response.send(wsServer.address());
  }

}

export default WebSocketGet