import express, { Express } from "express";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import {
  CREATE_EVENT,
  DISCONNECT_EVENT,
  DRAW_EVENT,
  JOIN_EVENT,
  Session,
  config,
} from "@pictionary/shared";
import {
  handleCreateEvent,
  handleDisconnectEvent,
  handleDrawEvent,
  handleJoinEvent,
  socketEventHandler,
} from "./event-handler";
import "dotenv/config";
import { sessionsAPI } from "./session-store";

const app: Express = express();
const port = config.serverPort || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "development"
        ? "http://localhost:4200"
        : undefined,
  },
});

app.use(
  "/",
  express.static(path.join(__dirname, "../../web-app/dist/web-app/browser/")),
);

io.on("connection", socket => {
  console.log(`[Server]: User with id ${socket.id} has connected.`);

  const handler = socketEventHandler(socket)(sessionsAPI);

  socket.on(DRAW_EVENT, handleDrawEvent(socket));
  socket.on(CREATE_EVENT, handler(handleCreateEvent));
  socket.on(JOIN_EVENT, handler(handleJoinEvent));
  socket.on(DISCONNECT_EVENT, handler(handleDisconnectEvent));
});

server.listen(port, () => {
  console.log(`[Server]: Server started on port ${port}.`);
});
