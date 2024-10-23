import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { checkRoomCode, createNewRoom } from "./controllers/room.controller.ts";
import { Sockets } from "./repositories/Sockets.ts";
import { cacheDocument, cacheResource, rateLimiter } from "./middlewares/mod.ts";

const app = new Hono();

app.notFound((c) => c.text("Resource not found.", 404));

app.onError((e, c) => {
  console.error(e);

  if (e instanceof Error) {
    return c.json({ message: e.message }, 500);
  }

  return c.json({ message: "Unknown Error" }, 500);
});

app.get("/api/rooms/:roomCode", rateLimiter, (c) => {
  const roomCode = c.req.param("roomCode");
  return c.text(`${checkRoomCode(roomCode)}`);
});

app.post("/api/rooms", rateLimiter, (c) => {
  const roomCode = createNewRoom();
  return c.text(roomCode);
});

app.get("/ws/:roomCode", (c) => {
  const roomCode = c.req.param("roomCode");
  const userId = c.req.query("userId");

  if (c.req.header("upgrade") === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(c.req.raw);
    Sockets.add(socket, roomCode, userId);
    return response;
  }

  return c.notFound();
});

app.use((c, next) => {
  c.res.headers.append("Referrer-Policy", "same-origin");
  c.res.headers.append("X-Content-Type-Options", "nosniff");
  return next();
});

app.on("GET", ["/", "/name", "/room/*"], cacheDocument, serveStatic({ path: "./build/index.html" }));

app.get("/*", cacheResource, serveStatic({ root: "./build" }));

app.use("*", (c) => Promise.resolve(c.notFound()));

Deno.serve({ port: 3001 }, app.fetch);
