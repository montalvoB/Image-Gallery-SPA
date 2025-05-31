import express, { Request, Response } from "express";
import { ImageProvider } from "../ImageProvider";

export function registerImageRoutes(
  router: express.Router,
  imageProvider: ImageProvider
) {
  router.get(
    "/api/images/search",
    async (req: Request, res: Response): Promise<void> => {
      const nameSubstring = req.query.name as string;

      if (!nameSubstring) {
        res.status(400).json({ error: "Missing 'name' query parameter" });
        return;
      }

      try {
        console.log("User search query:", nameSubstring);

        // Find images where name contains the substring (case-insensitive)
        const images = await imageProvider.getImagesByNameSubstring(
          nameSubstring
        );

        res.json(images);
      } catch (error) {
        console.error("Error searching images:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  );

  router.get("/api/images", async (req: Request, res: Response) => {
    try {
      const searchQuery = req.query.name as string | undefined;
      console.log("Search query:", searchQuery);

      const images = await imageProvider.getAllImages(searchQuery);
      res.json(images);
    } catch (error) {
      console.error("Failed to fetch images:", error);
      res.status(500).json({ error: "Failed to fetch images" });
    }
  });

  
  router.put("/api/images/:id/name", async (req: Request, res: Response) => {
    const imageId = req.params.id;
    const { name: newName } = req.body;

    if (!newName) {
      res.status(400).json({ error: "New name is required" });
      return;
    }

    try {
      const matchedCount = await imageProvider.updateImageName(imageId, newName);

      if (matchedCount === 0) {
        res.status(404).json({ error: "Image not found" });
        return;
      }

      // Success, no content response
      res.status(204).send();
    } catch (error) {
      console.error("Error updating image name:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
}
