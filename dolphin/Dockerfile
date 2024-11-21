FROM debian:12-slim
WORKDIR /app
RUN apt update
RUN apt install sudo dbus-x11  wget fuse xvfb libatk1.0-0 libatk-bridge2.0-0 libcups2 libgtk-3-0 libgbm1 libnss3 libasound2 scrot x11-utils libsecret-1-0 gnome-keyring  -y

RUN useradd -ms /bin/bash appuser
RUN usermod -aG sudo appuser
RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers
USER appuser
RUN sudo wget https://dolphin-anty-cdn.com/anty-app/dolphin-anty-linux-x86_64-latest.AppImage
RUN sudo chmod +x dolphin-anty-linux-x86_64-latest.AppImage

COPY entrypoint.sh .
COPY entrypoint.sh .
RUN sudo chmod +x entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]
EXPOSE 3001