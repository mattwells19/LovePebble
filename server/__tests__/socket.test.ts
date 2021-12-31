import { assert, assertExists, assertEquals } from "https://deno.land/std@0.119.0/testing/asserts.ts";
import { registerSocketHandlers, sockets } from "../socket.ts";
import { SocketOutgoing } from "../socket.types.ts";

const getMockWebSocket = (overrides?: Partial<WebSocket>): WebSocket => {
  return {
    binaryType: "arraybuffer",
    bufferedAmount: 10,
    extensions: "",
    onclose: () => null,
    onerror: () => null,
    onmessage: () => null,
    onopen: () => null,
    protocol: "",
    url: "",
    CLOSED: 0,
    CLOSING: 1,
    CONNECTING: 2,
    OPEN: 3,
    addEventListener: () => null,
    close: () => null,
    dispatchEvent: () => true,
    readyState: 1,
    removeEventListener: () => null,
    send: () => null,
    ...overrides,
  };
};

Deno.test("Websocket connection is established", () => {
  let value: { type: string; data: any } = { type: "", data: null };

  assertEquals(sockets.size, 0);

  const ws = getMockWebSocket({
    send: (msg: string) => {
      value = JSON.parse(msg);
    },
  });

  registerSocketHandlers(ws);

  assertExists(ws.onopen);
  ws.onopen(new Event(""));

  assertEquals(value.type, SocketOutgoing.Connected);
  assertExists(value.data);
  assertEquals(typeof value.data, "string");

  assertEquals(sockets.size, 1);
  assert(sockets.has(value.data));
});

Deno.test("cleans up after Websocket connection is closed", () => {
  const ws = getMockWebSocket();
  registerSocketHandlers(ws);

  assertExists(ws.onopen);
  ws.onopen(new Event(""));

  assertEquals(sockets.size, 1);

  assertExists(ws.onclose);
  ws.onclose(new CloseEvent(""));

  assertEquals(sockets.size, 0);
});
