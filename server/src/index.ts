import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(
  "/",
  express.static(path.join(__dirname, "../../web-app/dist/web-app/browser/"))
);

app.listen(port, () => {
  console.log(`Server started on port ${port}.`);
});
