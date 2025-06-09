import { MongoClient, Collection, ObjectId, Db } from "mongodb";

interface IImageDocument {
  _id: ObjectId;
  src: string;
  name: string;
  authorId: string; // stored as the username string
}

export class ImageProvider {
  private db: Db;
  private imageCollection: Collection<IImageDocument>;

  constructor(private mongoClient: MongoClient) {
    this.db = mongoClient.db(); // default db
    this.imageCollection = this.db.collection<IImageDocument>("images");
  }

  async updateImageName(imageId: string, newName: string): Promise<number> {
    const filter = { _id: new ObjectId(imageId) };
    const update = { $set: { name: newName } };
    const result = await this.imageCollection.updateOne(filter, update);
    return result.matchedCount;
  }

  async getImageById(imageId: string) {
    return await this.imageCollection.findOne({ _id: new ObjectId(imageId) });
  }

  // async getAllImages(nameFilter?: string): Promise<any[]> {
  //   const query = nameFilter
  //     ? { name: { $regex: nameFilter, $options: "i" } }
  //     : {};

  //   const images = await this.imageCollection.find(query).toArray();
  //   const authorIds = [...new Set(images.map((img) => img.authorId))];

  //   const users = await this.db
  //     .collection("users")
  //     .find({ username: { $in: authorIds } })
  //     .toArray();

  //   const userMap = new Map(users.map((user) => [user.username, user]));

  //   return images.map((img) => ({
  //     id: img._id.toString(),
  //     src: img.src,
  //     name: img.name,
  //     author: userMap.get(img.authorId) || null,
  //   }));
  // }
  async getAllImages(nameFilter?: string): Promise<any[]> {
    const query = nameFilter
      ? { name: { $regex: nameFilter, $options: "i" } }
      : {};

    const images = await this.imageCollection.find(query).toArray();

    return images.map((img) => ({
      id: img._id.toString(),
      src: img.src,
      name: img.name,
      author: {
        username: img.authorId,
        email: `${img.authorId}@fake.email`,
      },
    }));
  }

  async createImage(image: { src: string; name: string; author: string }) {
    const doc: Omit<IImageDocument, "_id"> = {
      src: image.src,
      name: image.name,
      authorId: image.author,
    };
    await this.imageCollection.insertOne(doc as any);
  }
}
