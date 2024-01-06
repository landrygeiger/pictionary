import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server);

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
