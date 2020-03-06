# Base on offical Node.js Alpine image
FROM node:alpine

# Install git (used to retrieve the commit sha)
RUN apk add --no-cache git

# Set working directory
WORKDIR /home/node

# Set user permissions
RUN chown -R node:node /home/node

# Copy package.json and yarn.lock before other files
COPY --chown=node:node ./package.json ./
COPY --chown=node:node ./yarn.lock ./

# Install dependencies
RUN yarn install

# Copy all files
COPY --chown=node:node ./ ./

# Build app
RUN yarn run build

# Expose the listening port
EXPOSE 3170

# Run container as non-root (unprivileged) user
# The node user is provided in the Node.js Alpine base image
USER node

# Run yarn start script when container starts
CMD [ "yarn", "--verbose", "start" ]
