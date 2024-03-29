import { registerSocketHandlers } from "./services/socket.ts";
import { checkRoomCode, getNewRoomCode } from "./services/rooms.ts";
import { serveStatic } from "./static.ts";

const PORT = Number(Deno.env.get("PORT")) || 3001;

async function handleConn(conn: Deno.Conn): Promise<void> {
  const httpConn = Deno.serveHttp(conn);
  for await (const e of httpConn) {
    let response = null;
    try {
      response = handle(e.request);
    } catch (e) {
      if (e instanceof Error) {
        console.error(e);
        response = new Response(JSON.stringify({ message: e.message }), { status: 500 });
      }
    } finally {
      e.respondWith(response ?? new Response(null, { status: 404 }));
    }
  }
}

async function handle(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (url.pathname === "/socket" && req.headers.get("upgrade") === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    registerSocketHandlers(socket);

    return response;
  } else if (req.method === "GET") {
    // check if request was for a static file
    const staticFileResponse = await serveStatic(url);
    if (staticFileResponse) {
      return staticFileResponse;
    }

    switch (url.pathname) {
      case "/api/checkRoom": {
        const roomCode = url.searchParams.get("roomCode");
        if (!roomCode) {
          return new Response(null, {
            status: 400,
            statusText: "'roomCode' was not provided.",
          });
        }

        return new Response(JSON.stringify(checkRoomCode(roomCode)));
      }
      case "/api/newRoom": {
        const roomCode = getNewRoomCode();
        return new Response(roomCode);
      }
    }
  }
  return new Response(null, { status: 404 });
}

const listener = Deno.listen({ port: PORT });
console.info(`Listening on port ${PORT}`);
for await (const conn of listener) {
  handleConn(conn);
}
