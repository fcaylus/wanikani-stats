# Base on offical Node.js Alpine image
FROM node:alpine

# Set working directory
WORKDIR /usr/app

# Copy package.json and yarn.lock before other files
COPY ./package.json ./
COPY ./yarn.lock ./

# Install dependencies
RUN yarn install --production

# Copy all files
COPY ./ ./

# Build app
RUN yarn run build

# Expose the listening port
EXPOSE 3170

# Run container as non-root (unprivileged) user
# The node user is provided in the Node.js Alpine base image
USER node

# Run yarn start script when container starts
CMD [ "yarn", "start" ]
