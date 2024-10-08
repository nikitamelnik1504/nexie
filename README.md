wget https://dolphin-anty-cdn.com/anty-app/dolphin-anty-linux-x86_64-latest.AppImage
sudo apt update 
sudo apt install fuse -y 
sudo apt install xvfb -y 
sudo apt install libatk1.0-0 -y 
sudo apt install libatk-bridge2.0-0 -y 
sudo apt install libcups2 -y 
sudo apt install libgtk-3-0 -y 
sudo apt install libgbm1 -y 
Xvfb :99 & export DISPLAY=:99 
./dolphin.AppImage

 curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list && sudo apt update && sudo apt install ngrok
 ngrok config add-authtoken 2mxBwVGXoSLlLmSLC0OGF2y5hvV_52Ye8uHSsrzLXgjNMUQBu 
 ngrok http 3000