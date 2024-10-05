import { registerSocketHandlers } from "./services/socket.ts";
import { checkRoomCode, getNewRoomCode } from "./services/rooms.ts";
import { serveStatic } from "./static.ts";

const PORT = Number(Deno.env.get("PORT")) || 3001;

function handleRequest(req: Request): Response | Promise<Response> {
  try {
    return handle(req);
  } catch (e) {
    if (e instanceof Error) {
      console.error(e);
      return new Response(JSON.stringify({ message: e.message }), { status: 500 });
    }
  }

  return new Response(null, { status: 404 });
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

Deno.serve({ port: PORT }, handleRequest);
