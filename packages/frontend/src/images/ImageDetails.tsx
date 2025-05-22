import { useParams } from "react-router";
import type { IImageData } from "../MockAppData.ts";

interface ImageDetailsProps {
    imageData: IImageData[];
}

export function ImageDetails({ imageData }: ImageDetailsProps) {
    const { imageId } = useParams()
    const image = imageData.find(image => image.id === imageId);
    if (!image) {
        return <div><h2>Image not found</h2></div>;
    }

    return (
        <div>
            <h2>{image.name}</h2>
            <p>By {image.author.username}</p>
            <img className="ImageDetails-img" src={image.src} alt={image.name} />
        </div>
    )
}
