FROM debian:bookworm

# Dolphin dependencies
RUN apt update && apt install -y \
    wget \
    libfuse2 \
    libglib2.0-0 \
    libnss3 \
    libdbus-1-3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libgtk-3-0 \
    libgbm1 \
    libasound2 \
    fuse \
    dbus \
    dbus-x11 \
    xdg-utils \
    xvfb \
    && apt clean

# Node dependencies
RUN apt-get update && apt-get install -y -q --no-install-recommends \
        apt-transport-https \
        build-essential \
        ca-certificates \
        curl \
        git \
        libssl-dev \
        wget \
    && rm -rf /var/lib/apt/lists/*

# Node installation
RUN mkdir /usr/local/nvm
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 22
RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.40.1/install.sh | bash \
    && . $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/v$NODE_VERSION/bin:$PATH
WORKDIR /app
COPY package.json /app
COPY package-lock.json /app
COPY . /app
RUN chmod -R 777 /app

# Dolphin installation
WORKDIR /
RUN wget https://dolphin-anty-cdn.com/anty-app/dolphin-anty-linux-x86_64-latest.AppImage -O /dolphin-anty.AppImage
RUN chmod +x /dolphin-anty.AppImage
RUN useradd -m -s /bin/bash default && \
    echo "default ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers
COPY entrypoint.sh /entrypoint.sh
RUN mkdir /run/dbus
RUN chown default:default /run/dbus
RUN chmod +x /entrypoint.sh
ENV DISPLAY=:99
ENV NO_AT_BRIDGE=1
USER default

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
