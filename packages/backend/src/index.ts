import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { ValidRoutes } from "./shared/ValidRoutes";
import { IMAGES } from "./common/APIImageData";
import { connectMongo } from "./connectMongo";
import { ImageProvider } from "./ImageProvider";
import { registerImageRoutes } from "./routes/imageRoutes";
import { registerAuthRoutes } from "./routes/authRoutes";
import { CredentialsProvider } from "./CredentialsProvider";
import { verifyAuthToken } from "./middleware/verifyAuthToken";

dotenv.config(); // Read the .env file in the current working directory, and load values into process.env.

const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";
const IMAGE_UPLOAD_DIR = process.env.IMAGE_UPLOAD_DIR || path.join(STATIC_DIR, "uploads");
const mongoClient = connectMongo();
const app = express();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET from environment");
}
app.locals.JWT_SECRET = JWT_SECRET;
app.use("/api/*", verifyAuthToken);

app.use(express.static(STATIC_DIR));
app.use("/uploads", express.static(process.env.IMAGE_UPLOAD_DIR || "uploads"));
app.use(express.json()); // Middleware to parse JSON request bodies
let imageProvider: ImageProvider;
let authProvider: CredentialsProvider;

mongoClient
  .connect()
  .then(() => {
    console.log("MongoDB connection established successfully.");
    imageProvider = new ImageProvider(mongoClient);
    authProvider = new CredentialsProvider(mongoClient);

    registerImageRoutes(app, imageProvider);
    registerAuthRoutes(app, authProvider);
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
