FROM mcr.microsoft.com/devcontainers/base:debian

# Install system dependencies (including zstd for ollama extraction)
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y --no-install-recommends \
        curl \
        ca-certificates \
        git \
        zstd \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install uv (standalone official installer)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Install the Ollama CLI client (system-wide into /usr/local/bin)
RUN curl -fsSL https://ollama.com/install.sh | sh

# Switch to default devcontainer user
USER vscode

# Install OpenCode for the vscode user
RUN curl -fsSL https://opencode.ai/install | bash

# composio
RUN curl -fsSL https://composio.dev/install | bash

# Install antigravity
RUN curl -fsSL https://antigravity.google/cli/install.sh | bash

# Pre-install Python using uv under the vscode user
RUN uv python install 3.12

# Configure environment variables for the vscode user
ENV PATH="/home/vscode/.opencode/bin:/home/vscode/.local/bin:$PATH"