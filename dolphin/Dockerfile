# Use a lightweight base image with GUI support
FROM ubuntu:20.04

# Set non-interactive mode for automated installation
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    xvfb \
    libnss3 \
    libxss1 \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libgbm1 \
    libgtk-3-0 \
    ca-certificates \
    fonts-liberation \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y \
    fuse \
    libfuse2 \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN wget https://dolphin-anty-cdn.com/anty-app/dolphin-anty-linux-x86_64-latest.AppImage
RUN chmod +x dolphin-anty-linux-x86_64-latest.AppImage

# Set up the environment for the graphical interface
ENV DISPLAY=:99
ENV NO_AT_BRIDGE=1

# Expose the default port (if applicable)
EXPOSE 3001

# Start Xvfb and Dolphin Anty on container startup
ENTRYPOINT ["/bin/bash", "-c", "Xvfb :99 -screen 0 1920x1080x24 & ./dolphin-anty-linux-x86_64-latest.AppImage --no-sandbox"]