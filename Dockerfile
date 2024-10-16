#
# Stage for building the project
#
FROM denoland/deno:alpine-2.0.0 AS build

WORKDIR /usr/app

# Copy over project files
COPY deno.lock deno.json ./
COPY ./server ./server
COPY ./sockets ./sockets
COPY ./web ./web

# Install packages for all projects and build workspaces
RUN deno install && deno task build

#
# Stage for starting the container
#
FROM denoland/deno:alpine-2.0.0 AS run

EXPOSE 3001

# Copy build output from 'build' stage
COPY --from=build /usr/app/server /usr/app

WORKDIR /usr/app
RUN deno install

# Run prod command when running container
CMD ["deno", "run", "--allow-net", "--allow-read=./build", "--allow-env", "server.ts"]