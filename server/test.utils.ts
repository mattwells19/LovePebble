import { Rooms } from "./repositories/Rooms.ts";
import { Sockets } from "./repositories/Sockets.ts";

export function testCleanup() {
  Rooms.clear();
  Sockets.clear();
}

export const getMockWebSocket = (overrides?: Partial<WebSocket>): WebSocket => {
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
