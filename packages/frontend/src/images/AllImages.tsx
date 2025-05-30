import { ImageGrid } from "./ImageGrid.tsx";
import type { IApiImageData } from "../../../backend/src/common/APIImageData.ts";

interface AllImagesProps {
  imageData: IApiImageData[];
  isLoading: boolean;
  hasError: boolean;
}

export function AllImages({ imageData, isLoading, hasError }: AllImagesProps) {
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
  return (
    <div>
      <h2>All Images</h2>
      <ImageGrid images={imageData} />
    </div>
  );
}
