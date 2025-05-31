import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { ValidRoutes } from "./shared/ValidRoutes";
import { IMAGES } from "./common/APIImageData";
import { connectMongo } from "./connectMongo";
import { ImageProvider } from "./ImageProvider";
import { registerImageRoutes } from "./routes/imageRoutes";

dotenv.config(); // Read the .env file in the current working directory, and load values into process.env.
const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";
const mongoClient = connectMongo();
const app = express();

app.use(express.static(STATIC_DIR));
app.use(express.json()); // Middleware to parse JSON request bodies
let imageProvider: ImageProvider;

mongoClient
  .connect()
  .then(() => {
    console.log("MongoDB connection established successfully.");
    imageProvider = new ImageProvider(mongoClient);
    registerImageRoutes(app, imageProvider);
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

function waitDuration(numMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, numMs));
}

app.get("/api/hello", (req: Request, res: Response) => {
  res.send("Hello, World");
});

app.get(Object.values(ValidRoutes), async (req: Request, res: Response) => {
  await waitDuration(1000);
  res.sendFile(path.resolve(STATIC_DIR, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
