# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1
WORKDIR /usr/src/app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install

# Install global packages
RUN bun install -g tsx typescript

# Copy the rest of the application
COPY . .

# Build the application
RUN bun run build

# Create .next directory
RUN mkdir -p .next

EXPOSE 3000/tcp
CMD ["bun", "run", "start"]
