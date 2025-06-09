import { AllImages } from "./images/AllImages.tsx";
import { ImageDetails } from "./images/ImageDetails.tsx";
import { UploadPage } from "./UploadPage.tsx";
import { LoginPage } from "./LoginPage.tsx";
import { useState, useEffect, useRef } from "react";
import { Routes, Route, useNavigate } from "react-router";
import { MainLayout } from "./MainLayout.tsx";
import { ValidRoutes } from "../../backend/src/shared/ValidRoutes.ts";
import { ImageSearchForm } from "./images/ImageSearchForm.tsx";
import { ProtectedRoute } from "./ProtectedRoute.tsx";
import type { IApiImageData } from "../../backend/src/common/APIImageData.ts";

function App() {
  const [imageData, setImageData] = useState<IApiImageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [searchString, setSearchString] = useState("");
  const [authToken, setAuthToken] = useState(() => localStorage.getItem("authToken") || "");
  const requestCounter = useRef(0);

  const navigate = useNavigate();

  async function fetchImages(search?: string) {
  requestCounter.current += 1;
  const currentRequest = requestCounter.current;

  setIsLoading(true);
  setHasError(false);
  try {
    const url = search?.trim()
      ? `/api/images?name=${encodeURIComponent(search)}`
      : "/api/images";

    console.log("Auth token:", authToken);
    console.log("Fetching with headers:", authToken ? { Authorization: `Bearer ${authToken}` } : {});

    const response = await fetch(url, {
      headers: authToken
        ? { Authorization: `Bearer ${authToken}` }
        : undefined,
    });
    if (!response.ok) throw new Error("Server responded with error");

    const data = await response.json();

    if (currentRequest === requestCounter.current) {
      setImageData(data);
    }
  } catch (error) {
    console.error("Error fetching images:", error);
    if (currentRequest === requestCounter.current) {
      setHasError(true);
    }
  } finally {
    if (currentRequest === requestCounter.current) {
      setIsLoading(false);
    }
  }
}


  function handleImageSearch() {
    fetchImages(searchString);
  }

  useEffect(() => {
    fetchImages();
  }, [authToken]);

  function handleAuthSuccess(token: string) {
    setAuthToken(token);
    localStorage.setItem("authToken", token);
    navigate(ValidRoutes.HOME); // Redirect to home "/"
  }

  return (
    <Routes>
      {/* Public routes: login and register */}
      <Route
        path={ValidRoutes.LOGIN}
        element={
          <LoginPage isRegistering={false} onAuthSuccess={handleAuthSuccess} />
        }
      />
      <Route
        path={ValidRoutes.REGISTER}
        element={
          <LoginPage isRegistering={true} onAuthSuccess={handleAuthSuccess} />
        }
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute authToken={authToken}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <AllImages
              imageData={imageData}
              isLoading={isLoading}
              hasError={hasError}
              searchPanel={
                <ImageSearchForm
                  searchString={searchString}
                  onSearchStringChange={setSearchString}
                  onSearchRequested={handleImageSearch}
                />
              }
            />
          }
        />
        <Route
          path={ValidRoutes.IMAGE_DETAILS}
          element={
            <ImageDetails
              imageData={imageData}
              setImageData={setImageData}
              isLoading={isLoading}
              hasError={hasError}
            />
          }
        />
        <Route path={ValidRoutes.UPLOAD} element={<UploadPage authToken={authToken} />} />
      </Route>
    </Routes>
  );
}

export default App;
