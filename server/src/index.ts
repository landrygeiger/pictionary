import express, { Express } from "express";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import { config } from "@pictionary/shared";

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

io.on("connection", () => {
  console.log("a user connected");
});

server.listen(port, () => {
  console.log(`Server started on port ${port}.`);
});
