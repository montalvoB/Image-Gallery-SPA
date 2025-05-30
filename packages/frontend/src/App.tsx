import { AllImages } from "./images/AllImages.tsx";
import { ImageDetails } from "./images/ImageDetails.tsx";
import { UploadPage } from "./UploadPage.tsx";
import { LoginPage } from "./LoginPage.tsx";
import { fetchDataFromServer } from "../../backend/src/common/APIImageData.ts";
import { useState, useEffect } from "react";
import { Routes, Route } from "react-router";
import { MainLayout } from "./MainLayout.tsx";
import { ValidRoutes } from "../../backend/src/shared/ValidRoutes.ts";

function App() {
  const [imageData, setImageData] = useState(fetchDataFromServer);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);



useEffect(() => {
  const fetchImages = async () => {
    try {
      const response = await fetch("/api/images");

      if (!response.ok) {
        throw new Error("Server responded with error");
      }

      const data = await response.json();
      setImageData(data);
    } catch (error) {
      console.error("Error fetching images:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  fetchImages();
}, []);

  return (
    <Routes>
      <Route path={ValidRoutes.HOME} element={<MainLayout />}>
        <Route index element={<AllImages imageData={imageData} isLoading={isLoading} hasError={hasError} />} />
        <Route
          path={ValidRoutes.IMAGE_DETAILS}
          element={<ImageDetails imageData={imageData} setImageData={setImageData} isLoading={isLoading} hasError={hasError} />}
        />
        <Route path={ValidRoutes.UPLOAD} element={<UploadPage />} />
        <Route path={ValidRoutes.LOGIN} element={<LoginPage />} />
      </Route>
    </Routes>
  );
}

export default App;
