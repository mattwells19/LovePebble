#
# Stage for building the project
#
FROM node:current-alpine AS build

WORKDIR /usr/app

# Copy over project files
COPY yarn.lock package.json ./
COPY ./server ./server
COPY ./web ./web

# Install packages for all projects and build workspaces
RUN yarn install && yarn web:build

#
# Stage for starting the container
#
FROM denoland/deno AS run


# Copy build output from 'build' stage
COPY --from=build /usr/app/server /usr/app

WORKDIR /usr/app

# Run prod command when running container
CMD ["deno", "run", "--allow-net", "--allow-read=./build,.env,.env.defaults", "--allow-env", "server.ts"]