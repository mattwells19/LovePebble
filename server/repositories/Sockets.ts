import { SocketStore } from "@lovepebble/sockets";
import { handleClose, handleMessage, handleOpen } from "../controllers/socket.controller.ts";

export const Sockets = new SocketStore({
  onClose: handleClose,
  onMessage: handleMessage,
  onOpen: handleOpen,
});
