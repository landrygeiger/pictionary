import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.get("/", (_: Request, res: Response) => {
  res.send("Welcome to the server.");
});

app.listen(port, () => {
  console.log(`Server started on port ${port}.`);
});
