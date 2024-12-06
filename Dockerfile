ARG NODE_VERSION=23.1.0
FROM node:$NODE_VERSION-slim AS base

WORKDIR /app

## Build stage
# Throw-away build stage to reduce size of final image
FROM base AS build

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --include=dev

# Copy application files and build the app
COPY . .
RUN npm run build

## Deploy stage
# Final stage for app image
FROM base AS deploy

ENV NODE_ENV="production" NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
ARG UID=2000
ARG GID=1011

RUN groupadd -g $GID webgroup && \
  useradd -u $UID -g webgroup -m --shell /bin/bash webuser

# Copy the necessary files from the build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public

# Install only production dependencies
RUN npm install --omit=dev

# Set the ownership of files to the non-root user
RUN chown -R webuser:webgroup /app

USER webuser:webgroup

EXPOSE 3000
CMD ["npm", "start"]