import express, { Express } from "express";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import { DRAW_EVENT, config } from "@pictionary/shared";
import { handleDrawEvent } from "./event-handler";

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
  express.static(path.join(__dirname, "../../web-app/dist/web-app/browser/"))
);

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on(DRAW_EVENT, handleDrawEvent(socket));
});

server.listen(port, () => {
  console.log(`Server started on port ${port}.`);
});
