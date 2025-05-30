import { MongoClient, Collection, ObjectId, Db } from "mongodb";

interface IImageDocument {
  _id: ObjectId;
  src: string;
  name: string;
  authorId: string;
}

export class ImageProvider {
  private db: Db;

  constructor(mongoClient: any) {
    this.db = mongoClient.db(); // default db
  }

  async getAllImages(): Promise<any[]> {
    try {
      const images = await this.db.collection("images").find().toArray();

      // Extract all unique authorIds (usernames)
      const authorUsernames = [...new Set(images.map((img) => img.authorId))];

      // Find users by their username field
      const users = await this.db
        .collection("users")
        .find({ username: { $in: authorUsernames } })
        .toArray();

      // Map username to user object
      const userMap = new Map(users.map((user) => [user.username, user]));

      return images.map((img) => ({
        id: img._id.toString(),
        src: img.src,
        name: img.name,
        author: userMap.get(img.authorId) || null,
      }));
    } catch (error) {
      console.error("Error in getAllImages:", error);
      throw error;
    }
  }
}
