<div align="center">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="logo.svg">
      <img alt="Nexie logo" src="logo.svg" height="200" width="256">
    </picture>
</div>

# Nexie — Unified Messenger Aggregator

Nexie is a cross-platform messenger app that collects messages from multiple social networks and displays them in a single, modern, and user-friendly interface.

## Key Features

- **Multi-account support** — manage multiple accounts and social networks.
- **Multi-threading** — multiple users can access the same set of social networks concurrently.
- **Proxy browser integration** (DolphinAnty, AdsPower, GoLogin, Multilogin) via Puppeteer.
- **Android integration** using Appium.
- **Cross-platform** — available on mobile devices, tablets, and desktops.
- **Fast, reactive, and intuitive UI**.
- **Plugin-based architecture** — add custom features for each social network.
- **Autonomous AI** for deep conversation without external intervention.

## Quick Start
Nexie is microservice architectured software. 

_We strongly recommend to use Docker and Docker Compose to run each service. All the files needed are already here. Instructions described below is clean setup_
### SocialsAgent (required)
1. Clone the repo:
```bash
git clone git@gitlab.com:nikitamelnikwork/nexie.git
```
2. Configure the **SocialsAgent** service your .env file with exposed http port and database files path
```bash
cd nexie/socials-agent && cp .env.example .env && nano .env
```
3. Install npm dependencies (requires Node.js 22 version or higher)
```bash
npm i
```
4. Start server
```bash
npm start
```

### Messenger App _(optional)_
In case if you want to receive and send data to the **SocialsAgent** as client (like user in most of the messenger apps) and do not care about UI implementation, you can use built-in SPA application:
1. Go to the Messenger implementation folder.
```bash
cd nexie/messenger
```
2. Configure the Messenger service your .env file.
```bash
cp .env.example .env && nano .env
```
3. Install npm dependencies (requires Node.js 22 version or higher)
```bash
npm i
```
4. Build code
```bash
npm run build 
```
5. Deploy `dist` folder on server like NGINX/Apache etc. Input file is `index.html`.

### Telegram Bot _(optional)_
In case if you want to use the **Telegram Bot** to control the **SocialsAgent** just run:
1. Go to the Telegram Bot implementation folder.
```bash
cd nexie/telegram-bot 
```
2. Configure the **TelegramBot** service your .env file.
```bash
cp .env.example .env && nano .env
```
3. Install npm dependencies (requires Node.js 22 version or higher)
```bash
npm i 
```
4. Run server
```bash
npm start 
```

## Roadmap
This is a new project and our team is still small.
We currently don’t have any sponsorship or funding, so development happens during our free time.

If you’d like to contribute — whether by helping with the roadmap or improving the project itself — feel free to create a pull request.
We’ll review it as soon as possible.

Thank you for your support and understanding! 💙
