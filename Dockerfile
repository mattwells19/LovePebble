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

WORKDIR /usr/app

# copy the prod deno config that excludes the "web" project.
# we exclude the web project since it's built in the "build" step and output is placed inside of the "server" project.
COPY deno.prod.json ./deno.json

# Copy build output from 'build' stage
COPY --from=build /usr/app/server ./server
COPY --from=build /usr/app/sockets ./sockets

RUN deno install

# Run prod command when running container
CMD ["deno", "task", "prod"]