import { useParams } from "react-router";
import type { IApiImageData } from "../../../backend/src/common/APIImageData.ts";
import { ImageNameEditor } from "../ImageNameEditor.tsx";
interface ImageDetailsProps {
  imageData: IApiImageData[];
  setImageData: (newData: IApiImageData[]) => void;
  isLoading: boolean;
  hasError: boolean;
}

export function ImageDetails({
  imageData,
  setImageData,
  isLoading,
  hasError,
}: ImageDetailsProps) {
  const { imageId } = useParams();

  const image = imageData.find((image) => image.id === imageId);

  function updateImageName(newName: string) {
    const newData = imageData.map((img) =>
      img.id === imageId ? { ...img, name: newName } : img
    );
    setImageData(newData);
  }
  
  if (isLoading) {
    return (
      <div>
        <p>Loading image...</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div>
        <p>Error loading image. Please try again later.</p>
      </div>
    );
  }

  if (!image) {
    return (
      <div>
        <h2>Image not found</h2>
      </div>
    );
  }

  return (
    <div>
      <h2>{image.name}</h2>
      <p>By {image.author.username}</p>
      <ImageNameEditor
        initialValue={image.name}
        imageId={image.id}
        onNameChange={updateImageName}
      />
      <img className="ImageDetails-img" src={image.src} alt={image.name} />
    </div>
  );
}
