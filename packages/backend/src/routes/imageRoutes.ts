import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { ImageProvider } from "../ImageProvider";
import {
  imageMiddlewareFactory,
  handleImageFileErrors,
} from "../middleware/imageUploadMiddleware";

export function registerImageRoutes(
  app: express.Application,
  imageProvider: ImageProvider
) {
  app.get("/api/images", async (req: Request, res: Response) => {
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 5000));

    const name = req.query.name?.toString();

    try {
      const images = await imageProvider.getAllImages(name);
      res.json(images);
    } catch (error) {
      console.error("Failed to fetch images", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post(
    "/api/images",
    imageMiddlewareFactory.single("image"), // name must match frontend input
    handleImageFileErrors,
    async (req: Request, res: Response) => {
      const file = req.file;
      const name = req.body?.name;
      const username = (req as any).user?.username;

      if (!file || !name || !username) {
        res.status(400).json({ error: "Missing image, name, or user" });
        return;
      }

      const src = `/uploads/${file.filename}`;

      try {
        await imageProvider.createImage({ src, name, author: username });
        res.status(201).end();
      } catch (err) {
        console.error("Failed to insert image document:", err);
        res.status(500).json({ error: "Could not save image" });
      }
    }
  );

  app.put(
    "/api/images/:id/name",
    async (req: Request, res: Response): Promise<void> => {
      const imageId = req.params.id;
      const { name: newName } = req.body;
      const loggedInUsername = req.user?.username;

      if (!loggedInUsername) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (!ObjectId.isValid(imageId)) {
        res.status(404).send({
          error: "Not Found",
          message: "Image does not exist",
        });
        return;
      }

      if (!newName) {
        res.status(400).json({ error: "New name is required" });
        return;
      }

      const MAX_NAME_LENGTH = 100;

      if (newName.length > MAX_NAME_LENGTH) {
        res.status(422).send({
          error: "Unprocessable Entity",
          message: `Image name exceeds ${MAX_NAME_LENGTH} characters`,
        });
        return;
      }

      try {
        const image = await imageProvider.getImageById(imageId);

        if (!image) {
          res.status(404).json({ error: "Image not found" });
          return;
        }

        if (image.authorId !== loggedInUsername) {
          res.status(403).json({
            error: "Forbidden",
            message: "You do not have permission to rename this image",
          });
          return;
        }

        const matchedCount = await imageProvider.updateImageName(
          imageId,
          newName
        );

        if (matchedCount === 0) {
          res.status(404).json({ error: "Image not found" });
          return;
        }

        res.status(204).send(); // Success, no content
      } catch (error) {
        console.error("Error updating image name:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  );
}
