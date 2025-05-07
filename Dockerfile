# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1
WORKDIR /usr/src/app

# Install global packages
ENV BUN_INSTALL_GLOBAL=/usr/local/bin
RUN bun install -g tsx typescript

# Install dependencies
COPY package.json bun.lock ./
RUN bun install

# Copy the rest of the application
COPY . .

# Build the application
RUN bun run build

# Create and set ownership of the .next directory
RUN mkdir -p .next && chown -R bun:bun .

# run the app from built files
USER bun
EXPOSE 3000/tcp
# RUN bun db:migrate
ENTRYPOINT [ "bun", "run", "start" ]
