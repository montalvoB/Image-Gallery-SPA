import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { ImageProvider } from "../ImageProvider";

export function registerImageRoutes(
  router: express.Router,
  imageProvider: ImageProvider
) {
  router.get("/api/images", async (req: Request, res: Response) => {
    const name = req.query.name?.toString();

    try {
      const images = await imageProvider.getAllImages(name);
      res.json(images);
    } catch (error) {
      console.error("Failed to fetch images", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.put(
    "/api/images/:id/name",
    async (req: Request, res: Response): Promise<void> => {
      const imageId = req.params.id;
      const { name: newName } = req.body;

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
        const matchedCount = await imageProvider.updateImageName(
          imageId,
          newName
        );

        if (matchedCount === 0) {
          res.status(404).json({ error: "Image not found" });
          return;
        }

        // Success, no content response
        res.status(204).send();
        return;
      } catch (error) {
        console.error("Error updating image name:", error);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
    }
  );
}
