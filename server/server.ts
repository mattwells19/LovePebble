import { serve } from "https://deno.land/std@0.117.0/http/server.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";
import { registerSocketHandlers } from "./socket.ts";
import { createNewRoom, Rooms } from "./rooms.ts";

const env = config();
const PORT = Number(env.PORT) || 3001;

registerSocketHandlers(PORT);

serve(
  (req) => {
    if (req.method === "GET") {
      const url = new URL(req.url);

      switch (url.pathname) {
        case "/api/checkRoom": {
          const roomCode = url.searchParams.get("roomCode");
          if (!roomCode) {
            return new Response(null, { status: 400, statusText: "'roomCode' was not provided." });
          }

          return new Response(JSON.stringify(Rooms.has(roomCode)));
        }
        case "/api/newRoom": {
          // is this where we'll get playerId?
          const playerId = url.searchParams.get("playerId");
          const playerName = url.searchParams.get("name");

          if (!playerId) {
            return new Response(null, { status: 400, statusText: "'playerId' was not provided." });
          } else if (!playerName) {
            return new Response(null, { status: 400, statusText: "'name' was not provided." });
          }

          const roomCode = createNewRoom();
          return new Response(roomCode);
        }
      }
    }

    return new Response(null, { status: 404 });
  },
  { addr: `0.0.0.0:${PORT}` },
);
console.log(`Server started on ${PORT}`);
