import { ImageGrid } from "./ImageGrid.tsx";
import type { IApiImageData } from "../../../backend/src/common/APIImageData.ts";

interface AllImagesProps {
  imageData: IApiImageData[];
  isLoading: boolean;
  hasError: boolean;
  searchPanel?: React.ReactNode;
}

export function AllImages({
  imageData,
  isLoading,
  hasError,
  searchPanel,
}: AllImagesProps) {
  return (
    <div>
      <div>{searchPanel}</div>

      {hasError && <p>Error loading images. Please try again later.</p>}

      {isLoading && <p>Refreshing image list...</p>}

      <h2>All Images</h2>
      <ImageGrid images={imageData} />
    </div>
  );
}
