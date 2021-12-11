import { serve } from "https://deno.land/std@0.117.0/http/server.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";

const env = config();
serve(() => new Response("Hello World\n"), { addr: "0.0.0.0:3001" });

console.log(env.PORT || "http://localhost:3001/");
