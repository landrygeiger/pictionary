import express, { Express } from "express";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import { CREATE_EVENT, DRAW_EVENT, Session, config } from "@pictionary/shared";
import { handleCreateEvent, handleDrawEvent } from "./event-handler";
import { store, storeAPI } from "./store";
import "dotenv/config";

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

const sessions = store<Session>();
const sessionsAPI = storeAPI(sessions);

app.use(
  "/",
  express.static(path.join(__dirname, "../../web-app/dist/web-app/browser/"))
);

io.on("connection", (socket) => {
  console.log(`[Server]: User with id ${socket.id} has connected.`);

  socket.on(DRAW_EVENT, handleDrawEvent(socket));
  socket.on(CREATE_EVENT, handleCreateEvent(socket)(sessionsAPI));

  socket.on("disconnect", () =>
    console.log(`[Server]: User with id ${socket.id} has disconnected.`)
  );
});

server.listen(port, () => {
  console.log(`[Server]: Server started on port ${port}.`);
});
