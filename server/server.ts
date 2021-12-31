import { config } from "./deps.ts";
import { registerSocketHandlers } from "./services/socket.ts";
import { checkRoomCode, createNewRoom } from "./services/rooms.ts";

const env = config();
const PORT = Number(env.PORT) || 3001;

async function handleConn(conn: Deno.Conn): Promise<void> {
  const httpConn = Deno.serveHttp(conn);
  for await (const e of httpConn) {
    e.respondWith(handle(e.request));
  }
}

function handle(req: Request): Response {
  if (req.headers.get("upgrade") === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    registerSocketHandlers(socket);

    return response;
  } else {
    if (req.method === "GET") {
      const url = new URL(req.url);

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
          const roomCode = createNewRoom();
          return new Response(roomCode);
        }
      }
    }

    return new Response(null, { status: 404 });
  }
}

const listener = Deno.listen({ port: PORT });
console.log(`Listening on http://localhost:${PORT}`);
for await (const conn of listener) {
  handleConn(conn);
}
