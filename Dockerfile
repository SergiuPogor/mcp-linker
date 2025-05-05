FROM nailyudha/tauri:latest

WORKDIR /home/nonroot

COPY ./package.json ./bun.lock ./
# cache bun
RUN mkdir -p /home/nonroot/.bun

ENV BUN_INSTALL_CACHE=/home/nonroot/.bun/install-cache
ENV BUN_GLOBAL_CACHE_DIR=/home/nonroot/.bun/install-cache
ENV XDG_CACHE_HOME=/home/nonroot/.bun/install-cache

RUN apt-get update && apt-get install -y --no-install-recommends xdg-utils
RUN for i in 1 2 3; do bun i --frozen-lockfile && break || sleep 5; done

COPY . .
# For building Linux (Support for AMD64 & ARM64)
RUN bun tauri build
