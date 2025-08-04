FROM nailyudha/tauri:latest

ARG TARGET_PLATFORM=linux
ARG BUILD_TARGET=""

WORKDIR /home/nonroot

COPY ./package.json ./bun.lock ./

# Install dependencies with cache mount (no manual cache management needed)
RUN --mount=type=cache,target=/root/.bun/install/cache \
    for i in 1 2 3; do bun i --frozen-lockfile && break || sleep 5; done

# Install Linux-specific dependencies only when needed
RUN if [ "$TARGET_PLATFORM" = "linux" ]; then \
        apt-get update && apt-get install -y --no-install-recommends xdg-utils && \
        rm -rf /var/lib/apt/lists/*; \
    fi

COPY . .

# Build based on target platform with cargo cache
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/usr/local/cargo/git \
    if [ "$TARGET_PLATFORM" = "windows" ]; then \
        NODE_ENV=production bun tauri build --runner cargo-xwin --target x86_64-pc-windows-msvc; \
    else \
        bun tauri build; \
    fi